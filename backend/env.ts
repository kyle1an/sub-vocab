import { createEnv } from '@t3-oss/env-core'
import process from 'node:process'
import { z } from 'zod'

export const env = createEnv({
  server: {
    PUBLIC_SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    POSTGRES_URL: z.string().url(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
