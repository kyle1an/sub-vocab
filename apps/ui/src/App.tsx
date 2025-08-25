import './main.css'

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Provider } from 'jotai'
import { queryClientAtom } from 'jotai-tanstack-query'
import { useHydrateAtoms } from 'jotai/utils'
import { Fragment } from 'react'
import { I18nextProvider } from 'react-i18next'
import { RouterProvider } from 'react-router/dom'

import type { AppRouter } from '@backend/app'

import { TRPCProvider } from '@/api/trpc'
import { JotaiDevtools } from '@/components/JotaiDevtools'
import { env } from '@/env'
import i18n from '@/i18n'
import { queryClient } from '@/lib/query-client'
import { omitUndefined } from '@/lib/utilities'
import { router } from '@/router'
import { myStore } from '@/store/useVocab'

const persister = createAsyncStoragePersister({
  storage: typeof localStorage === 'undefined' ? undefined : localStorage,
})
const HydrateAtoms = ({ children }: { children: React.ReactNode }) => {
  useHydrateAtoms([[queryClientAtom, queryClient]])
  return children
}
const baseUrl = env.VITE_SUB_API_URL
const trpcClient = createTRPCClient<AppRouter>({
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

function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <I18nextProvider i18n={i18n} defaultNS="translation">
          <Provider store={myStore}>
            <HydrateAtoms>
              <RouterProvider router={router} />
              <ReactQueryDevtools />
              {import.meta.env.PROD ? (
                <Fragment>
                  <SpeedInsights />
                  <Analytics />
                </Fragment>
              ) : (
                <JotaiDevtools />
              )}
            </HydrateAtoms>
          </Provider>
        </I18nextProvider>
      </TRPCProvider>
    </PersistQueryClientProvider>
  )
}

export default App
