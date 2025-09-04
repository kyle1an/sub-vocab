'use client'

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { ComposeContextProvider } from 'foxact/compose-context-provider'
import { queryClientAtom } from 'jotai-tanstack-query'
import { useHydrateAtoms } from 'jotai/utils'

import type { AppRouter } from '@backend/app'

import { env } from '@/env'
import { queryClient } from '@/lib/query-client'
import { TRPCProvider } from '@/trpc/client'
import { isServer, omitUndefined } from '@sub-vocab/utils/lib'

const persister = createAsyncStoragePersister({
  storage: isServer ? undefined : localStorage,
})
const HydrateAtoms = ({ children }: { children?: React.ReactNode }) => {
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

export function Providers({ children }: { children?: React.ReactNode }) {
  return (
    <ComposeContextProvider
      contexts={[
        /* eslint-disable react/no-missing-key */
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }} />,
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient} children={null} />,
        <HydrateAtoms />,
        /* eslint-enable react/no-missing-key */
      ]}
    >
      <ReactQueryDevtools />
      {children}
    </ComposeContextProvider>
  )
}
