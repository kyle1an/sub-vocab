import process from 'node:process'
import dotenv from 'dotenv'
import mysql from 'mysql2'
import Sql from 'sql-template-tag'

dotenv.config()

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  multipleStatements: true,
})

export function sql<T>(...args: Parameters<typeof Sql>) {
  const query = Sql(...args)
  return pool.promise().query(query) as Promise<[T, mysql.FieldPacket[]]>
}
