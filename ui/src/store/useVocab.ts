import { create } from 'zustand'
import Cookies from 'js-cookie'
import { atomWithStorage } from 'jotai/utils'
import type { ArrayValues } from 'type-fest'
import { getOS } from '@/lib/utils'

type Store = {
  username: string
  setUsername: (name: string) => void
}

const initialState = {
  username: Cookies.get('_user') ?? '',
}

export const useVocabStore = create<Store>()(
  (set) => ({
    ...initialState,
    setUsername: (username) => {
      set((state) => ({
        username,
      }))
    },
  }),
)

export const DEFAULT_THEME = {
  value: 'auto',
  label: 'Auto',
  icon: 'gg:dark-mode',
} as const

export const THEMES = [
  {
    value: 'light',
    label: 'Light',
    icon: 'ph:sun',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: 'akar-icons:moon-fill',
  },
  DEFAULT_THEME,
] as const

export const themeAtom = atomWithStorage<ArrayValues<typeof THEMES>['value']>('theme', DEFAULT_THEME.value)

export const LIGHT_THEME_COLOR = 'rgb(255,255,254)'

export const metaThemeColorAtom = atomWithStorage('meta-theme-color', LIGHT_THEME_COLOR)

const os = getOS()
if (os) {
  document.documentElement.classList.add(os)
}

export const osAtom = atomWithStorage('os', os)
