import { createClient } from '@supabase/supabase-js'

import type { Database } from '@ui/src/types/database.types.ts'

import { env } from '@/env'

export const supabase = createClient<Database>(env.VITE_PUBLIC_SUPABASE_URL, env.VITE_PUBLIC_SUPABASE_ANON_KEY)
export const supabaseAuth = supabase.auth
export type Supabase = typeof supabase
