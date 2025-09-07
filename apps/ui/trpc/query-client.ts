import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from '@tanstack/react-query'
import ms from 'ms'
import superjson from 'superjson'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: ms('60min'),
        staleTime: ms('45min'),
        retry: 2,
        retryDelay: (failureCount) => (failureCount - 1) * ms('1s'),
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query)
          || query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  })
}
