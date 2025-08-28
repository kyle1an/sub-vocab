import { QueryClient } from '@tanstack/react-query'
import ms from 'ms'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: ms('60min'),
      staleTime: ms('45min'),
      retry: 2,
      retryDelay: (failureCount) => (failureCount - 1) * ms('1s'),
    },
  },
})
