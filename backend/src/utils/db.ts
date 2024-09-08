import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'

import type { Database } from '../../../ui/database.types.js'

import { env } from '../../env.js'

const connectionString = env.DATABASE_URL ?? ''
const sql = postgres(connectionString)

const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_KEY)

export {
  sql,
  supabase,
}
