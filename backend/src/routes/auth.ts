import { eq } from 'drizzle-orm'
import { Data, Effect } from 'effect'
import { z } from 'zod'

import { profiles, usersInAuth } from '@backend/drizzle/schema.ts'
import { publicProcedure, router } from '@backend/src/routes/trpc'
import { db, supabase } from '@backend/src/utils/db.ts'

const LOGIN_ERROR = 'Invalid username or password.'
const SOME_ERROR = 'something went wrong'

class GetEmailError extends Data.TaggedError('GetEmailError')<{
  message: string
}> {}

class LoginError extends Data.TaggedError('LoginError')<{
  message: string
}> {}

const getEmailByUsername = (username: string) => Effect.gen(function* () {
  const [row] = yield* Effect.tryPromise({
    try: () => db
      .select({
        email: usersInAuth.email,
      })
      .from(profiles)
      .innerJoin(usersInAuth, eq(profiles.id, usersInAuth.id))
      .where(eq(profiles.username, username))
      .limit(1),
    catch: (e) => {
      console.error(e)
      return new GetEmailError({ message: SOME_ERROR })
    },
  })
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
  const { data, error } = yield* Effect.tryPromise({
    try: () => supabase.auth.signInWithPassword({
      email,
      password,
    }),
    catch: (e) => {
      console.error(e)
      return new LoginError({ message: SOME_ERROR })
    },
  })
  if (error) {
    console.error(error)
    return yield* new LoginError({ message: LOGIN_ERROR })
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
      const data = yield* signInWithPassword({
        email,
        password,
      })
      return data
    }).pipe(
      Effect.map((value) => ({
        data: value,
        error: null,
      })),
      Effect.catchAll((error) => Effect.succeed({
        data: null,
        error: {
          message: error.message,
        },
      })),
      Effect.mapError((e) => e satisfies never),
      Effect.runPromise,
    )),
})
