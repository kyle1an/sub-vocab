import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js'
import { atom } from 'jotai'

export const fileInfoAtom = atom('')
export const sourceTextAtom = atom({
  value: '',
  epoch: 0,
})

export const vocabSubscriptionAtom = atom<REALTIME_SUBSCRIBE_STATES>(REALTIME_SUBSCRIBE_STATES.CLOSED)

export const isSourceTextStaleAtom = atom(false)
