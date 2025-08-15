import type { RealtimeChannel, RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from '@supabase/supabase-js'

import { UTCDateMini } from '@date-fns/utc'
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js'
import { queryOptions, useMutation } from '@tanstack/react-query'
import { uniq } from 'es-toolkit'
import { produce } from 'immer'
import { atom, useAtomValue } from 'jotai'
import { withAtomEffect } from 'jotai-effect'
import { atomWithQuery } from 'jotai-tanstack-query'
import ms from 'ms'
import { toast } from 'sonner'

import type { LearningPhase, TrackedWord } from '@/lib/LexiconTrie'
import type { Tables } from '@ui/database.types'

import { sessionAtom, userIdAtom } from '@/atoms/auth'
import { createRetimer } from '@/atoms/utils'
import { vocabSubscriptionAtom } from '@/atoms/vocabulary'
import { documentVisibilityStateAtom } from '@/hooks/utils'
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
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
})

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
  // eslint-disable-next-line ts/no-use-before-define
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

type user_vocab_record = Tables<'user_vocab_record'>

const upsertVocabularyCallbackAtom = atom((get) => {
  const { queryKey } = get(userVocabularyOptionsAtom)
  return <T extends user_vocab_record>(payload: RealtimePostgresInsertPayload<T> | RealtimePostgresUpdatePayload<T>) => {
    const data = {
      w: payload.new.vocabulary,
      time_modified: payload.new.time_modified,
      learningPhase: getLearningPhase(payload.new.acquainted),
    }
    queryClient.setQueryData(queryKey, (prevData) => prevData && produce(prevData, (draft) => {
      const labelMutated = draft.find((label) => label.w === data.w)
      if (labelMutated) {
        Object.assign(labelMutated, data)
      } else {
        draft.push(data)
      }
    }))
  }
})

export const STATUS_LABELS = {
  SUBSCRIBED: 'Connected',
  CLOSED: 'Disconnected',
  CHANNEL_ERROR: 'Connection Error',
  TIMED_OUT: 'Connection Timeout',
} as const satisfies Partial<Record<REALTIME_SUBSCRIBE_STATES, string>>

const INACTIVITY_TIMEOUT = ms('1min')
const COMPONENT_DEBOUNCE = ms('3s')
const retimeRefetchVocabulary = createRetimer()
const channelBaseAtom = atom(undefined as RealtimeChannel | undefined)
const initChannelAtom = atom(null, (get, set, userId: string) => {
  const prevChannel = get(channelBaseAtom)

  if (prevChannel && (prevChannel.state === 'joined' || prevChannel.state === 'joining')) {
    return
  }

  const channel = supabase.channel(`user_${userId}_user_vocab_record`)
  channel.on<user_vocab_record>(
    'postgres_changes',
    {
      schema: 'public',
      table: 'user_vocab_record',
      event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT,
      filter: `user_id=eq.${userId}`,
    },
    get(upsertVocabularyCallbackAtom),
  )
  channel.on<user_vocab_record>(
    'postgres_changes',
    {
      schema: 'public',
      table: 'user_vocab_record',
      event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
      filter: `user_id=eq.${userId}`,
    },
    get(upsertVocabularyCallbackAtom),
  )
  channel.subscribe((status) => {
    set(vocabSubscriptionAtom, status)
    if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
      retimeRefetchVocabulary(() => {
        // eslint-disable-next-line ts/no-use-before-define
        const userVocabulary = get(userVocabularyAtom)
        if (!userVocabulary.isFetching) {
          userVocabulary.refetch()
        }
      })
    }
  })

  set(channelBaseAtom, channel)
})
const removeChannelAtom = atom(null, (get, set) => {
  const channel = get(channelBaseAtom)
  if (channel) {
    channel.unsubscribe()
    set(channelBaseAtom, undefined)
  }
})
const retimeChannel = createRetimer()

export const userVocabularyAtom = withAtomEffect(
  atomWithQuery((get) => get(userVocabularyOptionsAtom)),
  (get, set) => {
    if (get(documentVisibilityStateAtom) === 'hidden') {
      retimeChannel(() => {
        set(removeChannelAtom)
      }, INACTIVITY_TIMEOUT)

      return () => {
        retimeChannel()
      }
    }

    const userId = get(userIdAtom)
    if (userId) {
      const controller = new AbortController()
      retimeChannel()
      // https://github.com/supabase/realtime/issues/282#issuecomment-2630983759
      supabase.realtime.setAuth().then(() => {
        if (controller.signal.aborted) return
        retimeChannel()
        set(initChannelAtom, userId)
      })

      return () => {
        controller.abort()
        retimeChannel(() => {
          set(removeChannelAtom)
        }, COMPONENT_DEBOUNCE)
      }
    }

    retimeChannel()
    set(removeChannelAtom)
  },
)
