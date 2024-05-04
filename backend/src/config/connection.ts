import dotenv from 'dotenv'
import mysql from 'mysql2'

dotenv.config()

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  multipleStatements: true,
})

export function sql<T>(strings: TemplateStringsArray, ...values: any[]) {
  const escapedQuery = strings
    .map((s, index) => (index < values.length ? `${s}${mysql.escape(values[index])}` : s))
    .join('')
  console.log(escapedQuery)
  return pool.promise().query(escapedQuery) as Promise<[T, mysql.FieldPacket[]]>
}

export type RSH<T> = [T, mysql.ResultSetHeader]
