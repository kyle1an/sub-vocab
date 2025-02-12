import type { AppRouter } from '@backend/app'

import { createTRPCContext } from '@trpc/tanstack-react-query'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()
