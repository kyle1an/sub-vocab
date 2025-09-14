import { google } from '@ai-sdk/google'
import { streamObject } from 'ai'

import { categoriesSchema } from '@/app/api/categories/schema'

export const maxDuration = 60

export async function POST(req: Request) {
  const context = await req.json()

  const result = streamObject({
    model: google('gemini-2.5-flash-lite'),
    schema: categoriesSchema,
    prompt:
      `${context}`,
  })

  return result.toTextStreamResponse()
}
