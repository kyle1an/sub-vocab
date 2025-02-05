import type { RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from '@supabase/supabase-js'
import type { Tables } from '@ui/database.types'
import type { ValueOf } from 'type-fest'

import { UTCDateMini } from '@date-fns/utc'
import { REALTIME_CHANNEL_STATES } from '@supabase/supabase-js'
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { atomWithQuery } from 'jotai-tanstack-query'

import type { LearningPhase, VocabState } from '@/lib/LabeledTire'

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
  joined: 'Connected',
  closed: 'Disconnected',
  errored: 'Connection Error',
  joining: 'Connecting...',
  leaving: 'Disconnecting...',
} as const satisfies Partial<Record<RealtimeChannelState, string>>

const INACTIVITY_TIMEOUT_MS = MS_PER_MINUTE

export function useVocabRealtimeSync() {
  const [session] = useAtom(sessionAtom)
  const userId = session?.user?.id ?? ''
  const isTabActive = usePageVisibility()
  const { refetch } = useAtomValue(userVocabularyAtom)
  const [vocabRealtimeSubscribeState, setVocabRealtimeSubscribeState] = useAtom(vocabRealtimeSyncStatusAtom)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const unsubscribedRef = useRef(false) // did we actually unsub?
  const unsubscribeTimerRef = useRef<number | null>(null) // pending timer
  const upsertCallback = useRealtimeVocabUpsert()

  useEffect(() => {
    if (!userId) {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
      if (unsubscribeTimerRef.current) {
        clearTimeout(unsubscribeTimerRef.current)
        unsubscribeTimerRef.current = null
      }
      unsubscribedRef.current = false
      setVocabRealtimeSubscribeState(REALTIME_CHANNEL_STATES.closed)
      return
    }

    if (isTabActive) {
      // Cancel any pending unsubscribe if user came back quickly
      if (unsubscribeTimerRef.current) {
        clearTimeout(unsubscribeTimerRef.current)
        unsubscribeTimerRef.current = null
      }

      if (unsubscribedRef.current) {
        refetch()
        unsubscribedRef.current = false
      }

      if (
        !channelRef.current
        || channelRef.current.state === 'closed'
        || channelRef.current.state === 'errored'
      ) {
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
          .subscribe(() => {
            // Now we just read channel.state (which is effectively the same as the 'status' param)
            if (channel.state !== vocabRealtimeSubscribeState)
              setVocabRealtimeSubscribeState(channel.state)
          })

        channelRef.current = channel
      }
      else {
        // If the channel already exists, just update the atom with the latest .state (in case it changed while we were away)
        const currentState = channelRef.current.state
        if (currentState !== vocabRealtimeSubscribeState)
          setVocabRealtimeSubscribeState(currentState)
      }
    }
    else {
      unsubscribeTimerRef.current = setTimeout(() => {
        if (channelRef.current) {
          channelRef.current.unsubscribe()
          channelRef.current = null
          unsubscribedRef.current = true
          setVocabRealtimeSubscribeState(REALTIME_CHANNEL_STATES.closed)
        }
      }, INACTIVITY_TIMEOUT_MS)
    }
  }, [isTabActive, refetch, setVocabRealtimeSubscribeState, upsertCallback, userId, vocabRealtimeSubscribeState])

  // Cleanup on unmount or userId change
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
      if (unsubscribeTimerRef.current) {
        clearTimeout(unsubscribeTimerRef.current)
        unsubscribeTimerRef.current = null
      }
      unsubscribedRef.current = false
      setVocabRealtimeSubscribeState(REALTIME_CHANNEL_STATES.closed)
    }
  }, [setVocabRealtimeSubscribeState, userId])
}
