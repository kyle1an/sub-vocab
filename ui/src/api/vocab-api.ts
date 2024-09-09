import type { Session, User } from '@supabase/supabase-js'
import type { MergeDeep } from 'type-fest'

import { UTCDateMini } from '@date-fns/utc'
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { atom } from 'jotai'
import { useAtom } from 'jotai/react'
import { atomWithQuery } from 'jotai-tanstack-query'

import { LEARNING_PHASE, type LearningPhase, type VocabState } from '@/lib/LabeledTire'
import { queryClient, sessionAtom, supabase } from '@/store/useVocab'

function mergeUserVocabWithBaseVocab(userVocab: UserVocabulary[], baseVocab: BaseVocabulary[]) {
  const map = new Map<string, VocabState>()
  baseVocab.forEach((row) => {
    map.set(row.w, {
      word: row.w,
      isUser: Boolean(row.is_user),
      original: Boolean(row.original),
      rank: row.rank,
      timeModified: row.time_modified,
      learningPhase: !row.is_user ? LEARNING_PHASE.ACQUAINTED : LEARNING_PHASE.NEW,
    })
  })
  userVocab.forEach((row) => {
    const existing = map.get(row.w)
    if (existing) {
      map.set(row.w, {
        ...existing,
        timeModified: row.time_modified,
        learningPhase: row.learningPhase,
      })
    } else {
      map.set(row.w, {
        word: row.w,
        original: false,
        timeModified: row.time_modified,
        learningPhase: row.learningPhase,
        isUser: true,
        rank: null,
      })
    }
  })
  return Array.from(map.values())
}

type UserMetadata = {
  email: string
  email_verified: boolean
  phone_verified: boolean
  sub: string
  username?: string
}

export type UserWithUserMetadata = MergeDeep<User, {
  user_metadata: UserMetadata
}>

export type SessionWithUserMetadata = MergeDeep<Session, {
  user: UserWithUserMetadata
}>

async function getBaseVocabulary() {
  const { data, error } = await supabase
    .from('vocabulary_list')
    .select('w:word, original, is_user, rank:word_rank')
    .eq('share', true)
    .throwOnError()
  if (error) throw new Error(error.message)
  return data.map((row) => Object.assign(row, {
    time_modified: null,
  }))
}

export type BaseVocabulary = Awaited<ReturnType<typeof getBaseVocabulary>>[number]

export const baseVocabularyAtom = atomWithQuery(() => {
  return {
    queryKey: ['baseVocabulary'] as const,
    queryFn: getBaseVocabulary,
    placeholderData: [],
  }
})

async function getUserVocabularyRows(userId: string) {
  const { data, error } = await supabase
    .from('user_vocab_record')
    .select('w:vocabulary, time_modified, acquainted')
    .eq('user_id', userId)
    .throwOnError()
  if (error) throw new Error(error.message)
  return data.map((row) => Object.assign(row, {
    time_modified: new UTCDateMini(row.time_modified).toISOString(),
  }))
}

export type UserVocabularyRow = Awaited<ReturnType<typeof getUserVocabularyRows>>[number]

function rowToState(row: UserVocabularyRow) {
  const learningPhase = row.acquainted ? LEARNING_PHASE.ACQUAINTED : LEARNING_PHASE.NEW as LearningPhase
  return {
    w: row.w,
    time_modified: row.time_modified,
    learningPhase,
  }
}

export type UserVocabulary = Awaited<ReturnType<typeof rowToState>>

function userVocabularyOptions(userId: string) {
  return queryOptions({
    queryKey: ['userVocabularyRows', userId] as const,
    async queryFn() {
      const userVocabularyRows = await getUserVocabularyRows(userId)
      return userVocabularyRows.map(rowToState)
    },
    placeholderData: [],
    enabled: Boolean(userId),
  })
}

const userVocabularyAtom = atomWithQuery((get) => {
  const session = get(sessionAtom)
  const userId = session?.user.id ?? ''
  return userVocabularyOptions(userId)
})

export const userVocabWithBaseVocabAtom = atom((get) => {
  const { data: userVocabulary = [] } = get(userVocabularyAtom)
  const { data: baseVocabulary = [] } = get(baseVocabularyAtom)
  return mergeUserVocabWithBaseVocab(userVocabulary, baseVocabulary)
})

async function getStemsMapping() {
  const { data, error } = await supabase
    .from('derivation')
    .select('stem_word, derived_word')
    .order('stem_word')
    .throwOnError()
  if (error) throw new Error(error.message)
  const map: Record<string, string[]> = {}
  data.forEach((link) => {
    let wordGroup = map[link.stem_word]
    if (!wordGroup) {
      wordGroup = [link.stem_word]
      map[link.stem_word] = wordGroup
    }
    wordGroup.push(link.derived_word)
  })
  return Object.values(map)
}

export function useIrregularMapsQuery() {
  return useQuery({
    queryKey: ['stemsMapping'] as const,
    queryFn: getStemsMapping,
    placeholderData: [],
  })
}

function pendingVocabStates(oldData: UserVocabulary[], variables: VocabState[]) {
  const labelsCopy = structuredClone(oldData)
  variables.forEach((variable) => {
    const labelMutated = labelsCopy.find((label) => label.w === variable.word)
    const pendingPhase = variable.learningPhase === LEARNING_PHASE.ACQUAINTED ? LEARNING_PHASE.FADING : LEARNING_PHASE.RETAINING
    if (labelMutated) {
      labelMutated.learningPhase = pendingPhase
    } else {
      labelsCopy.push({
        w: variable.word,
        time_modified: '',
        learningPhase: pendingPhase,
      })
    }
  })
  return labelsCopy
}

function revertVocabStates(oldData: UserVocabulary[], variables: VocabState[]) {
  const labelsCopy = structuredClone(oldData)
  variables.forEach((variable) => {
    const labelMutated = labelsCopy.find((label) => label.w === variable.word)
    if (labelMutated) {
      labelMutated.learningPhase = variable.learningPhase
    }
  })
  return labelsCopy
}

function newVocabStates(oldData: UserVocabulary[], variables: UserVocabulary[]) {
  const labelsCopy = structuredClone(oldData)
  variables.forEach((variable) => {
    const labelMutated = labelsCopy.find((label) => label.w === variable.w)
    if (labelMutated) {
      variable.time_modified = new UTCDateMini(variable.time_modified).toISOString()
      Object.assign(labelMutated, variable)
    }
  })
  return labelsCopy
}

export function useUserWordPhaseMutation() {
  const [session] = useAtom(sessionAtom)
  const userId = session?.user.id ?? ''
  const vocabularyOptions = userVocabularyOptions(userId)
  return useMutation({
    mutationKey: ['upsertUserVocabulary'],
    mutationFn: async function mutateUserWordPhase(vocab: VocabState[]): Promise<UserVocabulary[]> {
      const values = vocab.map((row) => ({
        user_id: userId,
        vocabulary: row.word,
        acquainted: row.learningPhase !== LEARNING_PHASE.ACQUAINTED,
        time_modified: new Date().toISOString(),
      }))
      const { data, error } = await supabase
        .from('user_vocab_record')
        .upsert(values, { onConflict: 'user_id, vocabulary' })
        .select('w:vocabulary, time_modified, acquainted')
        .throwOnError()
      if (error) throw new Error(error.message)
      return data.map(rowToState)
    },
    onMutate: (variables) => {
      queryClient.setQueryData(vocabularyOptions.queryKey, (oldData = []) => pendingVocabStates(oldData, variables))
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(vocabularyOptions.queryKey, (oldData = []) => newVocabStates(oldData, data))
    },
    // eslint-disable-next-line node/handle-callback-err
    onError: (error, variables, context) => {
      queryClient.setQueryData(vocabularyOptions.queryKey, (oldData = []) => revertVocabStates(oldData, variables))
    },
  })
}
