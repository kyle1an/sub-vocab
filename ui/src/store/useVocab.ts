import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import type { Database } from '@ui/database.types'
import type { ArrayValues, PartialDeep } from 'type-fest'

import { useIsomorphicLayoutEffect } from '@react-hookz/web'
import { createClient, REALTIME_CHANNEL_STATES } from '@supabase/supabase-js'
import { QueryClient } from '@tanstack/react-query'
import { atom, createStore, useAtomValue } from 'jotai'
import { atomWithImmer } from 'jotai-immer'
import { atomFamily, atomWithStorage } from 'jotai/utils'
import { UAParser } from 'ua-parser-js'

import type { Download } from '@/api/opensubtitles'
import type { RealtimeChannelState } from '@/api/vocab-api'
import type { SubtitleData } from '@/components/subtitle/columns'
import type { THEMES } from '@/components/themes'
import type { ArrayConcat } from '@/lib/utilities'
import type { RowSelectionChangeFn } from '@/types/utils'

import { DEFAULT_THEME } from '@/components/themes'
import { MS_PER_MINUTE } from '@/constants/time'
import { env } from '@/env'
import { getLanguage } from '@/i18n'
import { SUPPORTED_FILE_EXTENSIONS } from '@/lib/filesHandler'
import { getScrollbarWidth } from '@/lib/utils'

export const sourceTextAtom = atom({
  text: '',
  version: 0,
})

export const vocabRealtimeSyncStatusAtom = atom<RealtimeChannelState>(REALTIME_CHANNEL_STATES.closed)

export const isSourceTextStaleAtom = atom(false)

export const subtitleSelectionStateAtom = atomWithImmer<Record<number, Record<string, boolean>>>({})

export const fileIdsAtom = atom((get) => {
  return Object.values(get(subtitleSelectionStateAtom)).flatMap((innerObj) => Object.keys(innerObj).filter((key) => innerObj[key]).map(Number))
})

export const subtitleDownloadProgressAtom = atomWithImmer<Download['Body'][]>([])

export const subtitleSelectionStateFamily = atomFamily((mediaId: number) => atom(
  (get) => get(subtitleSelectionStateAtom)[mediaId] ?? {},
  (get, set, ...[checked, row, mode]: ArrayConcat<Parameters<RowSelectionChangeFn<SubtitleData>>, []>) => {
    set(subtitleSelectionStateAtom, (selection) => {
      if (mode === 'singleRow') {
        selection[mediaId] = {}
      }
      else {
        selection[mediaId] ??= {}
        if (mode === 'singleSubRow') {
          const parent = row.getParentRow()
          if (parent) {
            for (const { id } of parent.subRows)
              selection[mediaId][id] = false
          }
        }
      }
      selection[mediaId][row.id] = Boolean(checked)
    })
  },
))

export const osLanguageAtom = atomWithStorage('osLanguageAtom', 'en')

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 60 * MS_PER_MINUTE,
      staleTime: 45 * MS_PER_MINUTE,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

export type Supabase = typeof supabase

export const supabase = createClient<Database>(env.VITE_PUBLIC_SUPABASE_URL, env.VITE_PUBLIC_SUPABASE_ANON_KEY)

const getOnInit = true

export const store = createStore()

export const themeAtom = atomWithStorage<ArrayValues<typeof THEMES>['value']>('themeAtom', DEFAULT_THEME.value, undefined, { getOnInit })

export const authChangeEventAtom = atom<AuthChangeEvent>()
export const sessionAtom = atomWithStorage<PartialDeep<Session> | null>('sessionAtom', null, undefined, { getOnInit })

export const LIGHT_THEME_COLOR = 'rgb(255,255,254)'

export const metaThemeColorAtom = atomWithStorage('metaThemeColorAtom', LIGHT_THEME_COLOR, undefined, { getOnInit })
export const isDrawerOpenAtom = atomWithStorage('isDrawerOpenAtom', false, undefined, { getOnInit })
export const prefersDarkAtom = atomWithStorage('prefersDarkAtom', false, undefined, { getOnInit })
export const isMdScreenAtom = atom(false)

export const localeAtom = atomWithStorage('localeAtom', getLanguage(), undefined, { getOnInit })

const uap = new UAParser()

export const uapAtom = atom(() => {
  if (typeof window !== 'undefined')
    return uap.getResult()
})

export function useDocumentInit() {
  const uap = useAtomValue(uapAtom)
  useIsomorphicLayoutEffect(() => {
    if (uap) {
      const { engine, os } = uap
      if (os.name)
        document.documentElement.classList.add(os.name)

      if (
        CSS.supports('background:paint(squircle)')
        && engine.name === 'Blink'
      )
        document.documentElement.classList.add('sq')

      const scrollbarWidth = getScrollbarWidth()
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)
    }
  }, [uap])
}

export type FileType = typeof fileTypes[number]

const fileTypes = SUPPORTED_FILE_EXTENSIONS.sort((a, b) => a.localeCompare(b)).map((type) => {
  return {
    type,
    checked: true,
  }
})

export const fileTypesAtom = atomWithStorage('fileTypesAtom', fileTypes)
