import { google } from '@ai-sdk/google'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { AISDKError, generateObject } from 'ai'
import { Data, Effect } from 'effect'
import { z } from 'zod'

import { env } from '@backend/env.ts'
import { publicProcedure, router } from '@backend/src/routes/trpc'

const SOME_ERROR = 'something went wrong'

class AICatError extends Data.TaggedError('AICatError')<{
  message: string
}> {}

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
})
const languageModel = google('gemini-2.5-flash-lite-preview-06-17')

export const aiRouter = router({
  getCategory: publicProcedure
    .input(z.object({
      prompt: z.string().min(1),
    }))
    .mutation(({ input }) => Effect.gen(function* () {
      return (yield* Effect.tryPromise({
        try: () => {
          return generateObject({
            model: languageModel,
            temperature: 0,
            schema: z.object({
              properName: z.array(z.string()),
              acronym: z.array(z.string()),
            }),
            mode: 'json',
            prompt: input.prompt,
          })
        },
        catch: (e) => {
          if (AISDKError.isInstance(e)) {
            return e
          }
          return new AICatError({ message: SOME_ERROR })
        },
      })).object
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
