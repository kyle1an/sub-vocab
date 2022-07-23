import dotenv from 'dotenv'
import mysql from 'mysql2'

dotenv.config()
const config = {
  connectionLimit: 10,
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  multipleStatements: true,
}
const pool = mysql.createPool(config)
export { pool }
