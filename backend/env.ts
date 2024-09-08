import { createEnv } from '@t3-oss/env-core'
// https://github.com/t3-oss/t3-env/issues/167
import 'dotenv/config'
import process from 'node:process'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
