import { createEnv } from '@t3-oss/env-core'
import process from 'node:process'
import { z } from 'zod'

export const env = createEnv({
  server: {
    PUBLIC_SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    POSTGRES_URL: z.string().url(),
    TMDB_TOKEN: z.string().min(1),
    OPENSUBTITLES_TOKEN: z.string().optional(),
    OPENSUBTITLES_API_KEY: z.string().min(1),
    APP_NAME__V_APP_VERSION: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
