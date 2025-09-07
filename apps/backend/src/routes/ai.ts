import { createOpenRouter } from '@openrouter/ai-sdk-provider'

import { env } from '@backend/env.ts'

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
})
