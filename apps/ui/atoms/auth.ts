import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import type { PartialDeep } from 'type-fest'

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const authChangeEventAtom = atom<AuthChangeEvent>()
export const sessionAtom = atomWithStorage<PartialDeep<Session> | null>('sessionAtom', null, undefined, { getOnInit: true })
export const userAtom = atomWithStorage<PartialDeep<User> | undefined>('userAtom', undefined, undefined, { getOnInit: true })
export const userIdAtom = atom((get) => get(userAtom)?.id)
export const accountAtom = atom((get) => {
  const user = get(userAtom)
  return user?.user_metadata?.username || user?.email || ''
})
export const avatarSourceAtom = atom((get) => {
  const account = get(accountAtom)
  if (account) {
    return `https://avatar.vercel.sh/${account}?size=${22}`
  }
})
