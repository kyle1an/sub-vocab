require('dotenv').config()

const config = {
  connectionLimit: 10,
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  multipleStatements: true,
};
const mysql = require('mysql2');
const pool = mysql.createPool(config);

export { pool }
