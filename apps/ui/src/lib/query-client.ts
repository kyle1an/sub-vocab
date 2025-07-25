import { QueryClient } from '@tanstack/react-query'
import { Duration } from 'effect'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Duration.toMillis('60 minutes'),
      staleTime: Duration.toMillis('45 minutes'),
      retry: 2,
      retryDelay: (failureCount) => (failureCount - 1) * Duration.toMillis('1 seconds'),
    },
  },
})
