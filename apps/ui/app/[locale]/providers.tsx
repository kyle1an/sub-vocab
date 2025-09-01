'use client'

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { ComposeContextProvider } from 'foxact/compose-context-provider'
import { Provider, useAtomValue } from 'jotai'
import { DevTools } from 'jotai-devtools'
import { queryClientAtom } from 'jotai-tanstack-query'
import { atomWithStorage, useHydrateAtoms } from 'jotai/utils'
import dynamic from 'next/dynamic'

import type { AppRouter } from '@backend/app'

import { TRPCProvider } from '@/api/trpc'
import { isDarkModeAtom } from '@/atoms'
import { myStore } from '@/atoms/store'
import { NoSSR } from '@/components/NoSsr'
import { env } from '@/env'
import { queryClient } from '@/lib/query-client'
import { isServer, omitUndefined } from '@sub-vocab/utils/lib'

const StyleComponent = dynamic(() => import('@/components/devtools-styles'))

const jotaiDevtoolsIsShellOpenAtom = atomWithStorage(`jotai-devtools-is-shell-open-V0`, false, undefined, { getOnInit: true })

function JotaiDevtools() {
  const jotaiDevtoolsIsShellOpen = useAtomValue(jotaiDevtoolsIsShellOpenAtom)
  const isDarkMode = useAtomValue(isDarkModeAtom)
  return (
    <NoSSR>
      <StyleComponent />
      <DevTools
        store={myStore}
        isInitialOpen={jotaiDevtoolsIsShellOpen}
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </NoSSR>
  )
}

const persister = createAsyncStoragePersister({
  storage: isServer ? undefined : localStorage,
})
const HydrateAtoms = ({ children }: { children: React.ReactNode }) => {
  useHydrateAtoms([[queryClientAtom, queryClient]])
  return children
}
const baseUrl = env.NEXT_PUBLIC_SUB_API_URL
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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ComposeContextProvider
      contexts={[
        /* eslint-disable react/no-missing-key */
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }} />,
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient} children={null} />,
        <Provider store={myStore} />,
        /* eslint-enable react/no-missing-key */
      ]}
    >
      <HydrateAtoms>
        <ReactQueryDevtools />
        {children}
      </HydrateAtoms>
      {process.env.NODE_ENV !== 'production' ? (
        <JotaiDevtools />
      ) : null}
    </ComposeContextProvider>
  )
}
