'use client'

import { useAtom, useStore } from 'jotai'

import { bodyBgColorAtom, metaThemeColorAtom } from '@/atoms'
import { authChangeEventAtom, sessionAtom } from '@/atoms/auth'
import { supabaseAuth } from '@/utils/supabase'
import { useAtomEffect, useStyleObserver } from '@sub-vocab/utils/hooks'
import { isServer } from '@sub-vocab/utils/lib'

export function useAppEffects() {
  const store = useStore()
  useAtomEffect((get, set) => {
    const { data: { subscription } } = supabaseAuth.onAuthStateChange((event, session) => {
      set(authChangeEventAtom, event)
      set(sessionAtom, session)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  useStyleObserver(isServer ? null : document.body, ([{ value }]) => {
    store.set(bodyBgColorAtom, value)
  }, {
    properties: ['background-color'],
  })
  useAtom(metaThemeColorAtom)
}
