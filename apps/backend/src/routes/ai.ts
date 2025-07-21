import { google } from '@ai-sdk/google'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { AISDKError, generateObject } from 'ai'
import { Console, Effect } from 'effect'
import { z } from 'zod'

import { env } from '@backend/env.ts'
import { publicProcedure, router } from '@backend/src/routes/trpc'

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
})

export const aiRouter = router({
  getCategory: publicProcedure
    .input(z.object({
      prompt: z.string().min(1),
    }))
    .mutation(({ input }) => Effect.gen(function* () {
      const languageModel = google('gemini-2.5-flash-lite-preview-06-17')
      const { object } = yield* Effect.tryPromise(() => generateObject({
        model: languageModel,
        temperature: 0,
        schema: z.object({
          properName: z.array(z.string()),
          acronym: z.array(z.string()),
        }),
        mode: 'json',
        prompt: input.prompt,
      })).pipe(
        Effect.mapError((error) => {
          if (AISDKError.isInstance(error.error)) {
            return error.error
          }
          return error
        }),
      )
      return object
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
