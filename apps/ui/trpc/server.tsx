import 'server-only'
import type { TRPCQueryOptions } from '@trpc/tanstack-react-query'

import { createTRPCClient, httpLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { cache } from 'react'

import { createTRPCContext } from './init'
import { makeQueryClient } from './query-client'
import { appRouter } from './routers/_app'

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient)
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
})
// If your router is on a separate server, pass a client:
createTRPCOptionsProxy({
  client: createTRPCClient({
    links: [httpLink({ url: '...' })],
  }),
  queryClient: getQueryClient,
})

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient()
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    void queryClient.prefetchInfiniteQuery(queryOptions as any)
  } else {
    void queryClient.prefetchQuery(queryOptions)
  }
}
