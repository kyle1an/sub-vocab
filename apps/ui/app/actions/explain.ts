'use server'

import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export async function explainText(text: string) {
  try {
    const { text: explanation } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: `Explain the following text concisely in the language of the text or English if it's not clear: "${text}"`,
    })
    return { success: true, data: explanation }
  } catch (error) {
    console.error('Error explaining text:', error)
    return { success: false, error: 'Failed to explain text' }
  }
}
