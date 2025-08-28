import { createTRPCContext } from '@trpc/tanstack-react-query'

import type { AppRouter } from '@backend/app'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()
