import { createTRPCRouter } from '@/trpc/init'
import { userRouter } from '@/trpc/routers/auth'

export const appRouter = createTRPCRouter({
  user: userRouter,
})
// export type definition of API
export type AppRouter = typeof appRouter
