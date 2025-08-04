import type { REALTIME_CHANNEL_STATES, RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from '@supabase/supabase-js'
import type { ValueOf } from 'type-fest'

import { UTCDateMini } from '@date-fns/utc'
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js'
import { queryOptions, useMutation } from '@tanstack/react-query'
import { uniq } from 'es-toolkit'
import { produce } from 'immer'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithQuery } from 'jotai-tanstack-query'
import ms from 'ms'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import type { LearningPhase, TrackedWord } from '@/lib/LexiconTrie'
import type { Supabase } from '@/lib/supabase'
import type { Tables } from '@ui/database.types'

import { sessionAtom } from '@/atoms/auth'
import { vocabSubscriptionAtom } from '@/atoms/vocabulary'
import { pageVisibilityAtom } from '@/hooks/utils'
import { buildTrackedWord, LEARNING_PHASE } from '@/lib/LexiconTrie'
import { queryClient } from '@/lib/query-client'
import { supabase } from '@/lib/supabase'
import { hasValue } from '@sub-vocab/utils/lib'
import { narrow } from '@sub-vocab/utils/types'

const getLearningPhase = (acquainted: boolean | null): LearningPhase => acquainted ? LEARNING_PHASE.ACQUAINTED : LEARNING_PHASE.NEW

const userVocabularyOptionsAtom = atom((get) => {
  const userId = get(sessionAtom)?.user?.id ?? ''
  return queryOptions({
    queryKey: ['userVocabularyOptionsAtom', userId],
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
  })
})

export const userVocabularyAtom = atomWithQuery((get) => get(userVocabularyOptionsAtom))

const sharedVocabularyAtom = atomWithQuery(() => {
  return {
    queryKey: ['sharedVocabularyAtom'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vocabulary_list')
        .select('w:word, o:original, u:is_user, r:word_rank')
        .eq('share', true)
        .throwOnError()
      return data.map(({ w, o, u, r }) => {
        const vocabState: TrackedWord = buildTrackedWord({
          form: w,
          isUser: Boolean(u),
          isBaseForm: Boolean(o),
          rank: r,
          learningPhase: !u ? LEARNING_PHASE.ACQUAINTED : LEARNING_PHASE.NEW,
        })
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
    const existing = map.get(row.w) ?? buildTrackedWord({
      form: row.w,
      isUser: true,
    })
    map.set(row.w, {
      ...existing,
      timeModified: row.time_modified,
      learningPhase: row.learningPhase,
    })
  })
  return Array.from(map.values())
})

export const irregularWordsQueryAtom = atomWithQuery(() => {
  return {
    queryKey: ['irregularWordsQueryAtom'],
    queryFn: async () => {
      const { data } = await supabase
        .from('derivation')
        .select('l:stem_word, i:derived_word')
        .order('stem_word')
        .throwOnError()
      return Object.entries(Object.groupBy(data, (d) => d.l)).filter(hasValue).map(([key, value]) => {
        const inflectedForms = value.map((v) => v.i)
        return narrow([
          key,
          ...uniq([
            ...inflectedForms,
            ...inflectedForms.filter((i) => i.includes(`'`)).map((i) => i.replace(/'/g, `’`)),
          ]),
        ])
      })
    },
    placeholderData: [],
  }
})

export function useUserWordPhaseMutation() {
  const session = useAtomValue(sessionAtom)
  const userId = session?.user?.id ?? ''
  const vocabularyOptions = useAtomValue(userVocabularyOptionsAtom)
  return useMutation({
    mutationKey: ['useUserWordPhaseMutation'],
    mutationFn: async (vocab: TrackedWord[]) => {
      const { data } = await supabase
        .from('user_vocab_record')
        .upsert(
          vocab.map((row) => ({
            user_id: userId,
            vocabulary: row.form,
            acquainted: row.learningPhase !== LEARNING_PHASE.ACQUAINTED,
            time_modified: new Date().toISOString(),
          })),
          { onConflict: 'user_id, vocabulary' },
        )
        .select('w:vocabulary, time_modified, acquainted')
        .throwOnError()
      return data.map((row) => ({
        w: row.w,
        time_modified: row.time_modified,
        learningPhase: getLearningPhase(row.acquainted),
      }))
    },
    onMutate: (variables) => {
      queryClient.setQueryData(vocabularyOptions.queryKey, (prevData) => prevData && produce(prevData, (draft) => {
        variables.forEach((variable) => {
          const labelMutated = draft.find((label) => label.w === variable.form)
          const pendingPhase = variable.learningPhase === LEARNING_PHASE.ACQUAINTED ? LEARNING_PHASE.FADING : LEARNING_PHASE.RETAINING
          if (labelMutated) {
            labelMutated.learningPhase = pendingPhase
          } else {
            draft.push({
              w: variable.form,
              time_modified: '',
              learningPhase: pendingPhase,
            })
          }
        })
      }))
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(vocabularyOptions.queryKey, (prevData) => prevData && produce(prevData, (draft) => {
        data.forEach((variable) => {
          const labelMutated = draft.find((label) => label.w === variable.w)
          if (labelMutated) {
            Object.assign(labelMutated, variable)
          }
        })
      }))
    },
    onError: (error, variables, context) => {
      console.error(error)
      toast.error(error.message)
      queryClient.setQueryData(vocabularyOptions.queryKey, (prevData) => prevData && produce(prevData, (draft) => {
        variables.forEach((variable) => {
          const labelMutated = draft.find((label) => label.w === variable.form)
          if (labelMutated) {
            labelMutated.learningPhase = variable.learningPhase
          }
        })
      }))
    },
  })
}

const realtimeVocabUpsertAtom = atom((get) => function <T extends Tables<'user_vocab_record'>>() {
  return (payload: RealtimePostgresInsertPayload<T> | RealtimePostgresUpdatePayload<T>) => {
    const data = {
      w: payload.new.vocabulary,
      time_modified: payload.new.time_modified,
      learningPhase: getLearningPhase(payload.new.acquainted),
    }
    queryClient.setQueryData(get(userVocabularyOptionsAtom).queryKey, (prevData) => prevData && produce(prevData, (draft) => {
      const labelMutated = draft.find((label) => label.w === data.w)
      if (labelMutated) {
        Object.assign(labelMutated, data)
      } else {
        draft.push(data)
      }
    }))
  }
})

export type RealtimeChannelState = ValueOf<typeof REALTIME_CHANNEL_STATES>

export const STATUS_LABELS = {
  SUBSCRIBED: 'Connected',
  CLOSED: 'Disconnected',
  CHANNEL_ERROR: 'Connection Error',
  TIMED_OUT: 'Connection Timeout',
} as const satisfies Partial<Record<REALTIME_SUBSCRIBE_STATES, string>>

const INACTIVITY_TIMEOUT_MS = ms('1min')

export function useVocabularySubscription() {
  const [session] = useAtom(sessionAtom)
  const userId = session?.user?.id
  const isTabActive = useAtomValue(pageVisibilityAtom)
  const { refetch } = useAtomValue(userVocabularyAtom)
  const setVocabSubscription = useSetAtom(vocabSubscriptionAtom)
  const channelRef = useRef<ReturnType<Supabase['channel']>>(null)
  const upsertCallback = useAtomValue(realtimeVocabUpsertAtom)

  useEffect(() => {
    function cleanup() {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
        setVocabSubscription(REALTIME_SUBSCRIBE_STATES.CLOSED)
      }
    }

    if (!userId) {
      cleanup()
      return
    }

    // If the tab is not active, we set a timer to unsubscribe.
    if (!isTabActive) {
      const timeoutId = setTimeout(() => {
        cleanup()
      }, INACTIVITY_TIMEOUT_MS)

      return () => {
        clearTimeout(timeoutId)
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
          setVocabSubscription(status)
        })
    }

    return () => {
      cleanup()
    }
  }, [userId, isTabActive, refetch, upsertCallback, setVocabSubscription])
}
