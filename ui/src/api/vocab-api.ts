import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { type Socket, io } from 'socket.io-client'
import { useEffect } from 'react'
import type { ClientToServerEvents, ServerToClientEvents, UserVocab, Username } from '@/shared/api'
import { postRequest } from '@/lib/request'
import { queryClient } from '@/lib/utils'
import { LEARNING_PHASE, type LearningPhase, type VocabState } from '@/lib/LabeledTire'
import { useVocabStore } from '@/store/useVocab'
import type {
  AcquaintWordsResponse,
  LabelDB,
  StemsMapping,
  ToggleWordResponse,
} from '@/shared/shared'
import { newVocabState } from '@/lib/vocab'

async function getVocabulary(username: string) {
  const labelsDB = await postRequest<LabelDB[]>(
    `/api/api/queryWords`,
    { username },
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
}

function getVocabularyOptions({ username }: Username) {
  return queryOptions({
    queryKey: ['userWords', username] as const,
    queryFn: () => getVocabulary(username),
    placeholderData: [],
    refetchOnWindowFocus: false,
    retry: 10,
  })
}

export function useVocabularyQuery() {
  const username = useVocabStore((state) => state.username)
  return useQuery(getVocabularyOptions({ username }))
}

function irregularMaps() {
  return postRequest<StemsMapping>(
    `/api/api/stemsMapping`,
    {},
    { timeout: 2000 },
  )
}

export function useIrregularMapsQuery() {
  return useQuery({
    queryKey: ['irregularMaps'] as const,
    queryFn: irregularMaps,
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
        ...variable,
        learningPhase: state,
      })
    }
  })

  return labelsCopy
}

export function useRevokeWordMutation() {
  const username = useVocabStore((state) => state.username)
  const vocabularyOptions = getVocabularyOptions({ username })
  return useMutation({
    mutationKey: ['revokeWord'],
    mutationFn: function revokeWord(vocab: VocabState[]) {
      return postRequest<ToggleWordResponse>(`/api/api/revokeWord`, {
        words: vocab.map((row) => row.word),
        username,
      } satisfies UserVocab)
    },
    onMutate: (variables) => {
      queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.FADING))
    },
    onSuccess: (data, variables, context) => {
      if (data === 'success') {
        queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.NEW))
      } else {
        queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.ACQUAINTED))
      }
    },
    // eslint-disable-next-line node/handle-callback-err
    onError: (error, variables, context) => {
      queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.ACQUAINTED))
    },
  })
}

export function useAcquaintWordsMutation() {
  const username = useVocabStore((state) => state.username)
  const vocabularyOptions = getVocabularyOptions({ username })
  return useMutation({
    mutationKey: ['acquaintWords'],
    mutationFn: function acquaintWords(rows2Acquaint: VocabState[]) {
      return postRequest<AcquaintWordsResponse>(`/api/api/acquaintWords`, {
        words: rows2Acquaint.map((row) => row.word),
        username,
      } satisfies UserVocab)
    },
    onMutate: (variables) => {
      queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.RETAINING))
    },
    onSuccess: (data, variables, context) => {
      if (data === 'success') {
        queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.ACQUAINTED))
      } else {
        queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.NEW))
      }
    },
    // eslint-disable-next-line node/handle-callback-err
    onError: (error, variables, context) => {
      queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.NEW))
    },
  })
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('', {
  withCredentials: true,
  retries: 1,
  autoConnect: false,
})

export function useSyncWordState() {
  const username = useVocabStore((state) => state.username)
  const { queryKey } = getVocabularyOptions({ username })

  useEffect(() => {
    if (username) {
      socket.connect()

      return () => {
        socket.disconnect()
      }
    }
  }, [username])

  useEffect(() => {
    if (username) {
      socket.on('acquaintWords', (v) => {
        const vocab = v.words.map((word): VocabState => {
          return newVocabState({
            word,
            learningPhase: LEARNING_PHASE.ACQUAINTED,
          })
        })
        queryClient.setQueryData(queryKey, (oldData) => mutatedVocabStates(oldData, vocab, LEARNING_PHASE.ACQUAINTED))
      })

      socket.on('revokeWord', (v) => {
        const vocab = v.words.map((word): VocabState => {
          return newVocabState({
            word,
            learningPhase: LEARNING_PHASE.NEW,
          })
        })
        queryClient.setQueryData(queryKey, (oldData) => mutatedVocabStates(oldData, vocab, LEARNING_PHASE.NEW))
      })

      socket.on('connect_error', (err) => {
        console.error(`connect_error due to ${err.message}`)
      })

      return () => {
        socket.off('acquaintWords')
        socket.off('revokeWord')
        socket.off('connect_error')
      }
    }
  }, [username, queryKey])
}
