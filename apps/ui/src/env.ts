import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod/v4-mini'

export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_SUB_API_URL: z.url(),
    VITE_PUBLIC_SUPABASE_ANON_KEY: z.string().check(z.minLength(1)),
    VITE_PUBLIC_SUPABASE_URL: z.url(),
    VITE_LEGACY_USER_EMAIL_SUFFIX: z.string().check(z.minLength(1)),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
})
