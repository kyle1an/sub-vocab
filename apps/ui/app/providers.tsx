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
import { Fragment } from 'react'
import { I18nextProvider } from 'react-i18next'

import type { AppRouter } from '@backend/app'

import { TRPCProvider } from '@/api/trpc'
import { _myAtomFamily } from '@/atoms'
import { isDarkModeAtom } from '@/atoms/ui'
import { env } from '@/env'
import i18n from '@/i18n'
import { queryClient } from '@/lib/query-client'
import { isServer, omitUndefined } from '@sub-vocab/utils/lib'

// after jotai-devtools
import { myStore } from '../atoms/store'

export const myAtomFamily = _myAtomFamily

const StyleComponent = dynamic(() => import('../components/devtools-styles'))

const jotaiDevtoolsIsShellOpenAtom = atomWithStorage(`jotai-devtools-is-shell-open-V0`, false, undefined, { getOnInit: true })

function JotaiDevtools() {
  const jotaiDevtoolsIsShellOpen = useAtomValue(jotaiDevtoolsIsShellOpenAtom)
  const isDarkMode = useAtomValue(isDarkModeAtom)
  return (
    <Fragment>
      <StyleComponent />
      <DevTools
        store={myStore}
        isInitialOpen={jotaiDevtoolsIsShellOpen}
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </Fragment>
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
        <PersistQueryClientProvider key="PersistQueryClientProvider" client={queryClient} persistOptions={{ persister }} />,
        <TRPCProvider key="TRPCProvider" trpcClient={trpcClient} queryClient={queryClient} children={null} />,
        <I18nextProvider key="I18nextProvider" i18n={i18n} defaultNS="translation" />,
        <Provider key="Provider" store={myStore} />,
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
