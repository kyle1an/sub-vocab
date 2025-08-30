import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'

import { env } from '@/env'

export const supabase = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
export const supabaseAuth = supabase.auth
export type Supabase = typeof supabase
