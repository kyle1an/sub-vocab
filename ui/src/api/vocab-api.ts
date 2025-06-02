import type { REALTIME_CHANNEL_STATES, RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from '@supabase/supabase-js'
import type { ValueOf } from 'type-fest'

import { UTCDateMini } from '@date-fns/utc'
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js'
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { produce } from 'immer'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithQuery } from 'jotai-tanstack-query'
import { useEffect, useRef } from 'react'

import type { LearningPhase, VocabState } from '@/lib/LabeledTire'
import type { Supabase } from '@/store/useVocab'
import type { Tables } from '@ui/database.types'

import { MS_PER_MINUTE } from '@/constants/time'
import { usePageVisibility } from '@/hooks/utils'
import { LEARNING_PHASE } from '@/lib/LabeledTire'
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
        .select('w:word, o:original, u:is_user, r:word_rank')
        .eq('share', true)
        .throwOnError()
      return data.map(({ w, o, u, r }) => {
        const vocabState: VocabState = {
          word: w,
          isUser: Boolean(u),
          original: Boolean(o),
          rank: r,
          timeModified: null,
          learningPhase: !u ? LEARNING_PHASE.ACQUAINTED : LEARNING_PHASE.NEW,
        }
        return [w, vocabState] as const
      })
    },
    placeholderData: [],
  }
})

export const baseVocabAtom = atom((get) => {
  const { data: userVocab = [] } = get(userVocabularyAtom)
  const { data: sharedVocab = [] } = get(sharedVocabularyAtom)
  const map = new Map(sharedVocab)
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
        isUser: true,
        original: false,
        rank: null,
        timeModified: row.time_modified,
        learningPhase: row.learningPhase,
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
        .select('w:vocabulary, t:time_modified, a:acquainted')
        .eq('user_id', userId)
        .throwOnError()

      return data.map(({ w, t, a }) => ({
        w,
        time_modified: new UTCDateMini(t).toISOString(),
        learningPhase: getLearningPhase(a),
      }))
    },
    placeholderData: [],
    enabled: Boolean(userId),
  }))
}

async function getStemsMapping() {
  const { data } = await supabase
    .from('derivation')
    .select('s:stem_word, d:derived_word')
    .order('stem_word')
    .throwOnError()
  const map: Record<string, string[]> = {}
  data.forEach(({ s, d }) => {
    let wordGroup = map[s]
    if (!wordGroup) {
      wordGroup = [s]
      map[s] = wordGroup
    }
    wordGroup.push(d)
    if (d.includes(`'`)) {
      const variant = d.replace(/'/g, `’`)
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

export type RealtimeChannelState = ValueOf<typeof REALTIME_CHANNEL_STATES>

export const statusLabels = {
  SUBSCRIBED: 'Connected',
  CLOSED: 'Disconnected',
  CHANNEL_ERROR: 'Connection Error',
  TIMED_OUT: 'Connection Timeout',
} as const satisfies Partial<Record<REALTIME_SUBSCRIBE_STATES, string>>

const INACTIVITY_TIMEOUT_MS = MS_PER_MINUTE

export function useVocabRealtimeSync() {
  const [session] = useAtom(sessionAtom)
  const userId = session?.user?.id
  const isTabActive = usePageVisibility()
  const { refetch } = useAtomValue(userVocabularyAtom)
  const setVocabRealtimeSubscribeState = useSetAtom(vocabRealtimeSyncStatusAtom)
  const channelRef = useRef<ReturnType<Supabase['channel']> | null>(null)
  const upsertCallback = useRealtimeVocabUpsert()

  useEffect(() => {
    function cleanup() {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
        setVocabRealtimeSubscribeState(REALTIME_SUBSCRIBE_STATES.CLOSED)
      }
    }

    if (!userId) {
      cleanup()
      return
    }

    // If the tab is not active, we set a timer to unsubscribe.
    if (!isTabActive) {
      const timerId = setTimeout(() => {
        cleanup()
      }, INACTIVITY_TIMEOUT_MS)

      return () => {
        clearTimeout(timerId)
      }
    }

    if (channelRef.current === null) {
      // Refetch data when a new subscription is about to be created after being inactive.
      refetch()

      channelRef.current = supabase
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
          setVocabRealtimeSubscribeState(status)
        })
    }

    return () => {
      cleanup()
    }
  }, [userId, isTabActive, refetch, upsertCallback, setVocabRealtimeSubscribeState])
}
