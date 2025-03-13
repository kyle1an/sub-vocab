import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'
import { z } from 'zod'

import { env } from '../../env.js'
import { publicProcedure, router } from './trpc.js'

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
})

export const aiRouter = router({
  getCategory: publicProcedure
    .input(z.object({
      prompt: z.string().min(1),
    }))
    .mutation(async (opts) => {
      const { prompt } = opts.input
      const { object } = await generateObject({
        model: openrouter.languageModel('google/gemini-2.0-pro-exp-02-05:free'),
        schema: z.object({
          properName: z.array(z.string()),
          acronym: z.array(z.string()),
        }),
        prompt,
      })
      return object
    }),
})
