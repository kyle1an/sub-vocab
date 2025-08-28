import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import type { PartialDeep } from 'type-fest'

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const authChangeEventAtom = atom<AuthChangeEvent>()
export const sessionAtom = atomWithStorage<PartialDeep<Session> | null>('sessionAtom', null, undefined, { getOnInit: true })
export const userIdAtom = atom((get) => get(sessionAtom)?.user?.id)
