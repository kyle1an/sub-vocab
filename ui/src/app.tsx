import './main.css'

import { CssVarsProvider } from '@mui/joy/styles'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { queryClientAtom } from 'jotai-tanstack-query'
import { useHydrateAtoms } from 'jotai/utils'
import { useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { RouterProvider } from 'react-router/dom'

import type { AppRouter } from '@backend/app'

import { TRPCProvider } from '@/api/trpc'
import { env } from '@/env'
import { useI18n } from '@/i18n'
import { omitUndefined } from '@/lib/utilities'
import { router } from '@/router'
import { queryClient } from '@/store/useVocab'

if (import.meta.env.DEV) {
  import('./styles/devtools.css')
}

function App() {
  const [persister] = useState(() => createSyncStoragePersister({
    storage: localStorage,
  }))
  useHydrateAtoms([[queryClientAtom, queryClient]])
  const i18n = useI18n()
  const baseUrl = env.VITE_SUB_API_URL
  const [trpcClient] = useState(() => createTRPCClient<AppRouter>({
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
  }))
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <I18nextProvider i18n={i18n} defaultNS="translation">
          <CssVarsProvider>
            <RouterProvider router={router} />
          </CssVarsProvider>
        </I18nextProvider>
      </TRPCProvider>
    </PersistQueryClientProvider>
  )
}

export default App
