import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { postRequest } from '@/lib/request'
import { queryClient } from '@/lib/utils'
import { LEARNING_PHASE, type LearningPhase, type VocabState } from '@/lib/LabeledTire'
import type { Username } from '@/api/user'
import { useSnapshotStore } from '@/store/useVocab'
import type {
  AcquaintWordsResponse, LabelDB, StemsMapping, ToggleWordResponse,
} from '@/types/shared'

export interface UserVocab extends Username {
  username: string
  words: string[]
}

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

const getVocabularyOptions = ({ username }: Username) => queryOptions({
  queryKey: ['userWords', username] as const,
  queryFn: () => getVocabulary(username),
  placeholderData: [],
  refetchOnWindowFocus: false,
  retry: 10,
})

export function useVocabularyQuery() {
  const { username } = useSnapshotStore()
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
  const { username } = useSnapshotStore()
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
      queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.REMOVING))
    },
    onSuccess: (data, variables, context) => {
      if (data === 'success') {
        queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.NEW))
      } else {
        queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.ACQUAINTED))
      }
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.ACQUAINTED))
    },
  })
}

export function useAcquaintWordsMutation() {
  const { username } = useSnapshotStore()
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
      queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.ACQUAINTING))
    },
    onSuccess: (data, variables, context) => {
      if (data === 'success') {
        queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.ACQUAINTED))
      } else {
        queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.NEW))
      }
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(vocabularyOptions.queryKey, (oldData) => mutatedVocabStates(oldData, variables, LEARNING_PHASE.NEW))
    },
  })
}
