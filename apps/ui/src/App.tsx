import './main.css'

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { ComposeContextProvider } from 'foxact/compose-context-provider'
import { Provider } from 'jotai'
import { queryClientAtom } from 'jotai-tanstack-query'
import { useHydrateAtoms } from 'jotai/utils'
import { Fragment } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Outlet } from 'react-router'
import { ClientOnly } from 'remix-utils/client-only'

import type { AppRouter } from '@backend/app'

import { TRPCProvider } from '@/api/trpc'
import { JotaiDevtools } from '@/components/Devtools'
import { env } from '@/env'
import i18n from '@/i18n'
import { queryClient } from '@/lib/query-client'
import { isServer, omitUndefined } from '@/lib/utilities'
import { myStore } from '@/store/useVocab'

const persister = createAsyncStoragePersister({
  storage: isServer ? undefined : localStorage,
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
    <ComposeContextProvider
      contexts={[
        <PersistQueryClientProvider key="PersistQueryClientProvider" client={queryClient} persistOptions={{ persister }} />,
        <TRPCProvider key="TRPCProvider" trpcClient={trpcClient} queryClient={queryClient} children={null} />,
        <I18nextProvider key="I18nextProvider" i18n={i18n} defaultNS="translation" />,
        <Provider key="Provider" store={myStore} />,
      ]}
    >
      <HydrateAtoms>
        <Outlet />
        <ReactQueryDevtools />
        <ClientOnly>
          {() => import.meta.env.PROD ? (
            <Fragment>
              <SpeedInsights />
              <Analytics />
            </Fragment>
          ) : (
            <JotaiDevtools />
          )}
        </ClientOnly>
      </HydrateAtoms>
    </ComposeContextProvider>
  )
}

export { App }
