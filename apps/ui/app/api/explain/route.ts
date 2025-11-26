import { google } from '@ai-sdk/google'
import { streamText } from 'ai'

export async function POST(req: Request) {
  const { prompt } = await req.json() as { prompt: string }

  const result = streamText({
    model: google('gemini-2.5-flash-lite'),
    prompt: `Explain the following text concisely in the language of the text or English if it's not clear: "${prompt}"`,
  })

  return result.toUIMessageStreamResponse()
}
