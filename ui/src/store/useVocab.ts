import type { AppRouter } from '@subvocab/backend/app'
import type { Database } from '@subvocab/ui/database.types'
import type { ArrayValues } from 'type-fest'

import { type AuthChangeEvent, createClient, type Session } from '@supabase/supabase-js'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { createStore } from 'jotai'
import { UAParser } from 'ua-parser-js'

import { MS_PER_MINUTE } from '@/constants/time'
import { env } from '@/env'
import { getLanguage } from '@/i18n'
import { SUPPORTED_FILE_EXTENSIONS } from '@/lib/filesHandler'
import { omitUndefined } from '@/lib/utilities'
import { getScrollbarWidth } from '@/lib/utils'

import { DEFAULT_THEME, type THEMES } from '../components/themes'

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

export const trpc = createTRPCReact<AppRouter>()

const baseUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_SUB_API_URL

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${baseUrl}/trpc`,
      fetch(url, options) {
        return fetch(url, omitUndefined({
          ...options,
          credentials: 'include',
        }))
      },
    }),
  ],
})

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
})

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
})

export const supabase = createClient<Database>(env.VITE_PUBLIC_SUPABASE_URL, env.VITE_PUBLIC_SUPABASE_ANON_KEY)

const getOnInit = true

export const store = createStore()

export const themeAtom = atomWithStorage<ArrayValues<typeof THEMES>['value']>('themeAtom', DEFAULT_THEME.value, undefined, { getOnInit })

export const authChangeEventAtom = atom <AuthChangeEvent>()
export const sessionAtom = atomWithStorage<Session | null>('sessionAtom', null, undefined, { getOnInit })

export const LIGHT_THEME_COLOR = 'rgb(255,255,254)'

export const metaThemeColorAtom = atomWithStorage('metaThemeColorAtom', LIGHT_THEME_COLOR, undefined, { getOnInit })
export const isDrawerOpenAtom = atomWithStorage('isBackgroundScaledAtom', false, undefined, { getOnInit })
export const prefersDarkAtom = atomWithStorage('prefersDarkAtom', false, undefined, { getOnInit })
export const isMdScreenAtom = atom(false)

export const localeAtom = atomWithStorage('localeAtom', getLanguage(), undefined, { getOnInit })

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

export const uapAtom = atomWithStorage('uapAtom', {
  browser,
  device,
  engine,
  os,
})

export type FileType = typeof fileTypes[number]

const fileTypes = SUPPORTED_FILE_EXTENSIONS.sort((a, b) => a.localeCompare(b)).map((type) => {
  return {
    type,
    checked: true,
  }
})

export const fileTypesAtom = atomWithStorage('fileTypesAtom', fileTypes)
