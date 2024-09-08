import type { ArrayValues } from 'type-fest'

import { createClient } from '@supabase/supabase-js'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { atomWithStorage } from 'jotai/utils'
import { UAParser } from 'ua-parser-js'

import { getLanguage } from '@/i18n'
import { SUPPORTED_FILE_EXTENSIONS } from '@/lib/filesHandler'
import { getScrollbarWidth } from '@/lib/utils'

import type { Database } from '../../database.types'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 60 * (60 * 1000),
      staleTime: 45 * (60 * 1000),
    },
  },
})

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
})

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
})

export const supabase = createClient<Database>(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY)

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

export const themeAtom = atomWithStorage<ArrayValues<typeof THEMES>['value']>('theme', DEFAULT_THEME.value, undefined, { getOnInit: true })

export const LIGHT_THEME_COLOR = 'rgb(255,255,254)'

export const metaThemeColorAtom = atomWithStorage('meta-theme-color', LIGHT_THEME_COLOR, undefined, { getOnInit: true })

export const localeAtom = atomWithStorage('_locale', getLanguage())

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
