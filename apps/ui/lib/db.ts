import { createClient } from '@supabase/supabase-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import type { Database } from '@/types/database.types.ts'

import * as schema from '@/drizzle/schema.ts'
import { env } from '@/env.ts'

const connectionString = env.POSTGRES_URL
// https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
const client = postgres(connectionString, { prepare: false })
const db = drizzle({ client, schema })

const supabase = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export {
  db,
  supabase,
}
