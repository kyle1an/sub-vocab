import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_SUB_API_URL: z.string().url(),
    VITE_PUBLIC_SUPABASE_ANON_KEY: z.string().nonempty(),
    VITE_PUBLIC_SUPABASE_URL: z.string().url(),
    VITE_LEGACY_USER_EMAIL_SUFFIX: z.string().nonempty(),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
})
