import { useEffect, useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { pick } from 'lodash-es'
import { postRequest } from './request'
import { queryClient } from './utils'
import { LEARNING_PHASE, type LearningPhase, type VocabState } from '@/lib/LabeledTire'
import type { Username } from '@/api/user'
import { useBearStore } from '@/store/useVocab'
import type {
  AcquaintWordsResponse, LabelDB, StemsMapping, ToggleWordResponse,
} from '@/types/shared'

export interface UserVocab extends Username {
  username: string
  words: string[]
}

export function useComponentWillUnmount(cleanupCallback = () => {}) {
  const callbackRef = useRef(cleanupCallback)
  callbackRef.current = cleanupCallback
  useEffect(() => {
    return () => callbackRef.current()
  }, [])
}

export function useVocabularyQuery() {
  const username = useBearStore((state) => state.username)
  return useQuery({
    queryKey: ['userWords', username],
    queryFn: async () => {
      const labelsDB = await postRequest<LabelDB[]>(
        `/api/api/queryWords`,
      { username } satisfies Username,
      { timeout: 4000 },
      )
      return labelsDB.map((sieve): VocabState => ({
        word: sieve.w,
        isUser: Boolean(sieve.is_user),
        original: Boolean(sieve.original),
        rank: sieve.rank,
        timeModified: sieve.time_modified,
        learningPhase: sieve.acquainted ? LEARNING_PHASE.ACQUAINTED : LEARNING_PHASE.NEW,
      }))
    },
    placeholderData: [],
    refetchOnWindowFocus: false,
    retry: 10,
  })
}

export function useIrregularMapsQuery() {
  return useQuery({
    queryKey: ['irregularMaps'],
    queryFn: () => postRequest<StemsMapping>(
      `/api/api/stemsMapping`,
      {},
      { timeout: 2000 },
    ),
    placeholderData: [],
    refetchOnWindowFocus: false,
    retry: 10,
  })
}

function mutatedVocabStates<T extends VocabState>(oldData: VocabState[] | undefined, variables: T[], state: LearningPhase) {
  if (!oldData) {
    return []
  }

  const labelsCopy = structuredClone(oldData)
  variables.forEach((variable) => {
    const labelMutated = labelsCopy.find((label) => label.word === variable.word)

    if (labelMutated) {
      labelMutated.learningPhase = state
    } else {
      labelsCopy.push({
        ...pick(variable, [
          'word',
          'rank',
          'original',
          'isUser',
          'timeModified',
        ]),
        learningPhase: state,
      })
    }
  })

  return labelsCopy
}

export function useRevokeWordMutation() {
  const username = useBearStore((state) => state.username)
  return useMutation({
    mutationKey: ['revokeWord'],
    mutationFn: (vocab: VocabState[]) => postRequest<ToggleWordResponse>(`/api/api/revokeWord`, {
      words: vocab.map((row) => row.word),
      username,
    } satisfies UserVocab),
    onMutate: (variables) => {
      queryClient.setQueryData(['userWords', username], (oldData?: VocabState[]) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.REMOVING))
    },
    onSuccess: (data, variables, context) => {
      if (data === 'success') {
        queryClient.setQueryData(['userWords', username], (oldData?: VocabState[]) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.NEW))
      } else {
        queryClient.setQueryData(['userWords', username], (oldData?: VocabState[]) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.ACQUAINTED))
      }
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['userWords', username], (oldData?: VocabState[]) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.ACQUAINTED))
    },
  })
}

export function useAcquaintWordsMutation() {
  const username = useBearStore((state) => state.username)
  return useMutation({
    mutationKey: ['acquaintWords'],
    mutationFn: (rows2Acquaint: VocabState[]) => postRequest<AcquaintWordsResponse>(`/api/api/acquaintWords`, {
      words: rows2Acquaint.map((row) => row.word),
      username,
    } satisfies UserVocab),
    onMutate: (variables) => {
      queryClient.setQueryData(['userWords', username], (oldData?: VocabState[]) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.ACQUAINTING))
    },
    onSuccess: (data, variables, context) => {
      if (data === 'success') {
        queryClient.setQueryData(['userWords', username], (oldData?: VocabState[]) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.ACQUAINTED))
      } else {
        queryClient.setQueryData(['userWords', username], (oldData?: VocabState[]) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.NEW))
      }
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(['userWords', username], (oldData?: VocabState[]) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.NEW))
    },
  })
}
