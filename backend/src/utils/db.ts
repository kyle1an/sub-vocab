import type { Database } from '@ui/database.types.js'

import { createClient } from '@supabase/supabase-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from '../../drizzle/schema.js'
import { env } from '../../env.js'

const connectionString = env.POSTGRES_URL
// https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
const client = postgres(connectionString, { prepare: false })
const db = drizzle({ client, schema })

const supabase = createClient<Database>(env.PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY)

export {
  db,
  supabase,
}
