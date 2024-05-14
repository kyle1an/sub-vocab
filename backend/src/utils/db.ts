import process from 'node:process'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL ?? ''
const sql = postgres(connectionString)

export { sql }
