import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { APICallError, generateObject } from 'ai'
import { Result, ResultAsync } from 'neverthrow'
import { z } from 'zod'

import type { ZodObj } from '@ui/src/types/utils'

import { env } from '@backend/env.ts'
import { publicProcedure, router } from '@backend/src/routes/trpc'

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
})

const errorSchema = z.object<ZodObj<{
  error: {
    message: string
  }
}>>({
  error: z.object({
    message: z.string(),
  }),
})

const safeJsonParse = Result.fromThrowable((s: string) => errorSchema.parse(JSON.parse(s)).error, (e) => ({
  message: 'Parse Error',
}))

export const aiRouter = router({
  getCategory: publicProcedure
    .input(z.object({
      prompt: z.string().nonempty(),
    }))
    .mutation(async (opts) => {
      const { prompt } = opts.input
      const result = await ResultAsync.fromPromise(generateObject({
        model: openrouter.languageModel('google/gemini-2.0-flash-exp:free'),
        temperature: 0,
        schema: z.object({
          properName: z.array(z.string()),
          acronym: z.array(z.string()),
        }),
        prompt,
      }), (e) => {
        if (APICallError.isInstance(e)) {
          const parseResult = safeJsonParse(e.responseBody ?? '')
          if (parseResult.isOk()) {
            return parseResult.value
          }
          else {
            return parseResult.error
          }
        }
        return {
          message: 'Unknown error',
        }
      })
      if (result.isOk()) {
        return {
          data: result.value.object,
          error: null,
        }
      }
      else {
        return {
          data: null,
          error: result.error,
        }
      }
    }),
})
