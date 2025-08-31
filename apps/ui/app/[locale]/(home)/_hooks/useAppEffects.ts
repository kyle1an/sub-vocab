'use client'

import { useCookieValue } from '@react-hookz/web/useCookieValue/index.js'
import { isSafari } from 'foxact/is-safari'
import { atom, useStore } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import ms from 'ms'

import { bodyBgColorAtom, mainBgColorAtom } from '@/atoms'
import { authChangeEventAtom, sessionAtom, userIdAtom } from '@/atoms/auth'
import { isDarkModeAtom } from '@/atoms/ui'
import { isAnyDrawerOpenAtom } from '@/components/ui/drawer'
import { supabaseAuth } from '@/utils/supabase'
import { useAtomEffect, useStyleObserver } from '@sub-vocab/utils/hooks'
import { isServer } from '@sub-vocab/utils/lib'

const isSafariAtom = atomWithStorage('isSafariAtom', isSafari())

const metaThemeColorAtom = atom((get) => {
  if (get(isAnyDrawerOpenAtom)) {
    if (get(isSafariAtom) && !get(isDarkModeAtom)) {
      return 'transparent'
    }
    return get(bodyBgColorAtom)
  }
  return get(mainBgColorAtom)
})

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
  useAtomEffect((get) => {
    if (isServer) return
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', get(metaThemeColorAtom))
  }, [])
  useAtomEffect((get) => {
    if (isServer) return
    document.documentElement.classList.toggle('dark', get(isDarkModeAtom))
  }, [])
}
