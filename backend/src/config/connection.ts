import mysql from 'mysql2'
import Sql from 'sql-template-tag'
import { env } from '../../env.js'

const pool = mysql.createPool({
  connectionLimit: 10,
  host: env.HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DATABASE,
  multipleStatements: true,
})

export function sql<T>(...args: Parameters<typeof Sql>) {
  const query = Sql(...args)
  return pool.promise().query(query) as Promise<[T, mysql.FieldPacket[]]>
}
