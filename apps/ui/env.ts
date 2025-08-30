import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod/v4-mini'

export const env = createEnv({
  client: {
    NEXT_PUBLIC_SUB_API_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().check(z.minLength(1)),
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_LEGACY_USER_EMAIL_SUFFIX: z.string().check(z.minLength(1)),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SUB_API_URL: process.env.NEXT_PUBLIC_SUB_API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_LEGACY_USER_EMAIL_SUFFIX: process.env.NEXT_PUBLIC_LEGACY_USER_EMAIL_SUFFIX,
  },
  emptyStringAsUndefined: true,
})
