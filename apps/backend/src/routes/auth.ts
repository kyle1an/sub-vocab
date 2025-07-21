import { eq } from 'drizzle-orm'
import { Console, Data, Effect } from 'effect'
import { z } from 'zod'

import { profiles, usersInAuth } from '@backend/drizzle/schema.ts'
import { publicProcedure, router } from '@backend/src/routes/trpc'
import { db, supabase } from '@backend/src/utils/db.ts'

const LOGIN_ERROR = 'Invalid username or password.'

class GetEmailError extends Data.TaggedError('GetEmailError')<{
  message: string
  cause?: unknown
}> {}

class LoginError extends Data.TaggedError('LoginError')<{
  message: string
  cause?: unknown
}> {}

const getEmailByUsername = (username: string) => Effect.gen(function* () {
  const [row] = yield* Effect.tryPromise(() => db
    .select({
      email: usersInAuth.email,
    })
    .from(profiles)
    .innerJoin(usersInAuth, eq(profiles.id, usersInAuth.id))
    .where(eq(profiles.username, username))
    .limit(1),
  )
  const email = row?.email
  if (!email) {
    return yield* new GetEmailError({ message: LOGIN_ERROR })
  }
  return email
})

const signInWithPassword = ({
  email,
  password,
}: {
  email: string
  password: string
}) => Effect.gen(function* () {
  const { data, error } = yield* Effect.tryPromise(() => supabase.auth.signInWithPassword({
    email,
    password,
  }))
  if (error) {
    return yield* new LoginError({ message: LOGIN_ERROR, cause: error })
  }
  return data
})

export const userRouter = router({
  signIn: publicProcedure
    .input(z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }))
    .mutation(({ input }) => Effect.gen(function* () {
      const {
        username,
        password,
      } = input
      const email = yield* getEmailByUsername(username)
      return yield* signInWithPassword({
        email,
        password,
      })
    }).pipe(
      Effect.map((value) => ({
        data: value,
        error: null,
      })),
      Effect.tapError(Console.error),
      Effect.catchAll((error) => Effect.succeed({
        data: null,
        error: {
          message: error.message,
        },
      })),
      Effect.ensureErrorType<never>(),
      Effect.runPromise,
    )),
})
