import type { RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from '@supabase/supabase-js'
import type { Tables } from '@ui/database.types'

import { UTCDateMini } from '@date-fns/utc'
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { atomWithQuery } from 'jotai-tanstack-query'

import { LEARNING_PHASE, type LearningPhase, type VocabState } from '@/lib/LabeledTire'
import { omitUndefined } from '@/lib/utilities'
import { queryClient, sessionAtom, supabase, vocabRealtimeSyncStatusAtom } from '@/store/useVocab'

const getLearningPhase = (acquainted: boolean | null): LearningPhase => acquainted ? LEARNING_PHASE.ACQUAINTED : LEARNING_PHASE.NEW

export const userVocabularyAtom = atomWithQuery((get) => {
  const session = get(sessionAtom)
  const userId = session?.user?.id ?? ''
  return userVocabularyOptions(userId)
})

const sharedVocabularyAtom = atomWithQuery(() => {
  return {
    queryKey: ['sharedVocabulary'] as const,
    queryFn: async () => {
      const { data } = await supabase
        .from('vocabulary_list')
        .select('w:word, original, is_user, rank:word_rank')
        .eq('share', true)
        .throwOnError()
      return data
    },
    placeholderData: [],
  }
})

export const baseVocabAtom = atom((get) => {
  const { data: userVocab = [] } = get(userVocabularyAtom)
  const { data: sharedVocab = [] } = get(sharedVocabularyAtom)
  const map = new Map<string, VocabState>()
  sharedVocab.forEach((row) => {
    map.set(row.w, {
      word: row.w,
      isUser: Boolean(row.is_user),
      original: Boolean(row.original),
      rank: row.rank,
      timeModified: null,
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
    }
    else {
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
})

function userVocabularyOptions(userId: string) {
  return omitUndefined(queryOptions({
    queryKey: ['userVocabularyRows', userId] as const,
    async queryFn() {
      const { data } = await supabase
        .from('user_vocab_record')
        .select('w:vocabulary, time_modified, acquainted')
        .eq('user_id', userId)
        .throwOnError()

      return data.map((row) => ({
        w: row.w,
        time_modified: new UTCDateMini(row.time_modified).toISOString(),
        learningPhase: getLearningPhase(row.acquainted),
      }))
    },
    placeholderData: [],
    enabled: Boolean(userId),
  }))
}

async function getStemsMapping() {
  const { data } = await supabase
    .from('derivation')
    .select('stem_word, derived_word')
    .order('stem_word')
    .throwOnError()
  const map: Record<string, string[]> = {}
  data.forEach((link) => {
    let wordGroup = map[link.stem_word]
    if (!wordGroup) {
      wordGroup = [link.stem_word]
      map[link.stem_word] = wordGroup
    }
    wordGroup.push(link.derived_word)
    if (link.derived_word.includes(`'`)) {
      const variant = link.derived_word.replace(/'/g, `’`)
      if (!wordGroup.includes(variant))
        wordGroup.push(variant)
    }
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

export function useUserWordPhaseMutation() {
  const [session] = useAtom(sessionAtom)
  const userId = session?.user?.id ?? ''
  const vocabularyOptions = userVocabularyOptions(userId)
  return useMutation({
    mutationKey: ['upsertUserVocabulary'],
    mutationFn: async (vocab: VocabState[]) => {
      const values = vocab.map((row) => ({
        user_id: userId,
        vocabulary: row.word,
        acquainted: row.learningPhase !== LEARNING_PHASE.ACQUAINTED,
        time_modified: new Date().toISOString(),
      }))
      const { data } = await supabase
        .from('user_vocab_record')
        .upsert(values, { onConflict: 'user_id, vocabulary' })
        .select('w:vocabulary, time_modified, acquainted')
        .throwOnError()
      return data.map((row) => ({
        w: row.w,
        time_modified: row.time_modified,
        learningPhase: getLearningPhase(row.acquainted),
      }))
    },
    onMutate: (variables) => {
      queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => oldData && produce(oldData, (draft) => {
        variables.forEach((variable) => {
          const labelMutated = draft.find((label) => label.w === variable.word)
          const pendingPhase = variable.learningPhase === LEARNING_PHASE.ACQUAINTED ? LEARNING_PHASE.FADING : LEARNING_PHASE.RETAINING
          if (labelMutated) {
            labelMutated.learningPhase = pendingPhase
          }
          else {
            draft.push({
              w: variable.word,
              time_modified: '',
              learningPhase: pendingPhase,
            })
          }
        })
      }))
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => oldData && produce(oldData, (draft) => {
        data.forEach((variable) => {
          const labelMutated = draft.find((label) => label.w === variable.w)
          if (labelMutated)
            Object.assign(labelMutated, variable)
        })
      }))
    },
    onError: (error, variables, context) => {
      console.error(error)
      queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => oldData && produce(oldData, (draft) => {
        variables.forEach((variable) => {
          const labelMutated = draft.find((label) => label.w === variable.word)
          if (labelMutated)
            labelMutated.learningPhase = variable.learningPhase
        })
      }))
    },
  })
}

function useRealtimeVocabUpsert<T extends Tables<'user_vocab_record'>>() {
  const [session] = useAtom(sessionAtom)
  const userId = session?.user?.id ?? ''
  const vocabularyOptions = userVocabularyOptions(userId)

  return (payload: RealtimePostgresInsertPayload<T> | RealtimePostgresUpdatePayload<T>) => {
    const data = {
      w: payload.new.vocabulary,
      time_modified: payload.new.time_modified,
      learningPhase: getLearningPhase(payload.new.acquainted),
    }
    queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => oldData && produce(oldData, (draft) => {
      const labelMutated = draft.find((label) => label.w === data.w)
      if (labelMutated)
        Object.assign(labelMutated, data)
      else
        draft.push(data)
    }))
  }
}

export function useVocabRealtimeSync() {
  const upsertCallback = useRealtimeVocabUpsert()
  const [session] = useAtom(sessionAtom)
  const userId = session?.user?.id ?? ''
  const [vocabRealtimeSubscribeState, setVocabRealtimeSubscribeState] = useAtom(vocabRealtimeSyncStatusAtom)

  useEffect(() => {
    if (userId) {
      const channel = supabase
        .channel(`user_${userId}_user_vocab_record`)
        .on(
          'postgres_changes',
          {
            schema: 'public',
            table: 'user_vocab_record',
            event: 'INSERT',
            filter: `user_id=eq.${userId}`,
          },
          upsertCallback,
        )
        .on(
          'postgres_changes',
          {
            schema: 'public',
            table: 'user_vocab_record',
            event: 'UPDATE',
            filter: `user_id=eq.${userId}`,
          },
          upsertCallback,
        )
        .subscribe((status) => {
          if (vocabRealtimeSubscribeState !== status)
            setVocabRealtimeSubscribeState(status)
        })

      return () => {
        channel.unsubscribe()
      }
    }
  }, [setVocabRealtimeSubscribeState, upsertCallback, userId, vocabRealtimeSubscribeState])
}
