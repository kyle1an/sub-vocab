import { createEnv } from '@t3-oss/env-core'
import process from 'node:process'
import { z } from 'zod'

export const env = createEnv({
  server: {
    PUBLIC_SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().nonempty(),
    POSTGRES_URL: z.string().url(),
    TMDB_TOKEN: z.string().nonempty(),
    OPENSUBTITLES_TOKEN: z.string().optional(),
    OPENSUBTITLES_API_KEY: z.string().nonempty(),
    APP_NAME__V_APP_VERSION: z.string().nonempty(),
    OPENROUTER_API_KEY: z.string().nonempty(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
