import { create } from 'zustand'
import Cookies from 'js-cookie'
import { atomWithStorage } from 'jotai/utils'
import type { ArrayValues } from 'type-fest'
import { UAParser } from 'ua-parser-js'
import { SUPPORTED_FILE_EXTENSIONS } from '@/lib/filesHandler'
import { getScrollbarWidth } from '@/lib/utils'

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

const getOnInit = true

export const themeAtom = atomWithStorage<ArrayValues<typeof THEMES>['value']>('theme', DEFAULT_THEME.value, undefined, { getOnInit })

export const LIGHT_THEME_COLOR = 'rgb(255,255,254)'

export const metaThemeColorAtom = atomWithStorage('meta-theme-color', LIGHT_THEME_COLOR, undefined, { getOnInit })

const uap = new UAParser()

export const {
  browser,
  device,
  engine,
  os,
} = uap.getResult()

if (os.name) {
  document.documentElement.classList.add(os.name)
}

if (
  CSS.supports('background:paint(squircle)')
  && engine.is('Blink')
) {
  document.documentElement.classList.add('sq')
}

const scrollbarWidth = getScrollbarWidth()
document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)

export const uapAtom = atomWithStorage('uap', {
  browser,
  device,
  engine,
  os,
})

export type FileType = {
  type: string
  checked: boolean
}

export const fileTypesAtom = atomWithStorage('fileTypes', SUPPORTED_FILE_EXTENSIONS.sort((a, b) => a.localeCompare(b)).map((type): FileType => {
  return {
    type,
    checked: true,
  }
}))
