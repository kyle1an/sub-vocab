import type { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js'

import { atom } from 'jotai'

export const vocabSubscriptionAtom = atom<REALTIME_SUBSCRIBE_STATES | null>(null)

export const isSourceTextStaleAtom = atom(false)
