import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { profiles, usersInAuth } from '@backend/drizzle/schema.ts'
import { publicProcedure, router } from '@backend/src/routes/trpc'
import { db, supabase } from '@backend/src/utils/db.ts'

export const userRouter = router({
  signIn: publicProcedure
    .input(z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }))
    .mutation(async (opts) => {
      const { username, password } = opts.input
      const rows = await db
        .select({
          email: usersInAuth.email,
        })
        .from(profiles)
        .innerJoin(usersInAuth, eq(profiles.id, usersInAuth.id))
        .where(eq(profiles.username, username))
        .limit(1)

      const [row] = rows
      const email = row?.email
      if (email) {
        const authResponse = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (!authResponse.error) {
          return authResponse
        }
      }
      return {
        data: {
          user: null,
          session: null,
          weakPassword: null,
        },
        error: {
          message: 'Invalid username or password.',
        },
      }
    }),
})
