import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import type { PartialDeep } from 'type-fest'

import { atom } from 'jotai'
import { withAtomEffect } from 'jotai-effect'
import { atomWithStorage } from 'jotai/utils'
import ms from 'ms'

import { isServer } from '@sub-vocab/utils/lib'

export const authChangeEventAtom = atom<AuthChangeEvent>()
export const sessionAtom = atomWithStorage<PartialDeep<Session> | null>('sessionAtom', null, undefined, { getOnInit: true })
export const userIdAtom = withAtomEffect(
  atom((get) => get(sessionAtom)?.user?.id, (get, set, userId: string) => {
    set(userIdAtom, userId)
  }),
  (get) => {
    if (isServer) return
    cookieStore.set({
      name: 'user_id',
      value: get(userIdAtom) || '',
      expires: Date.now() + ms('30d'),
    })
  },
)
