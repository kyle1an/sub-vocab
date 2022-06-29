const config = {
  connectionLimit: 10,
  host: '***REMOVED***',
  user: '***REMOVED***',
  password: '***REMOVED***',
  database: '***REMOVED***',
  multipleStatements: true,
};
const mysql = require('mysql2');
const pool = mysql.createPool(config);

module.exports.pool = pool;
