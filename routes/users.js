const express = require('express');
const router = express.Router();
const sql = require('../lib/sql');

const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '***REMOVED***',
  user: '***REMOVED***',
  password: '***REMOVED***',
  database: '***REMOVED***'
});

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;

module.exports.api = {//newsletterSignup
  queryWords: (req, res) => {
    pool.getConnection((err, connection) => {
      connection.query(sql.querySql.wordsQuery, (err, rows, fields) => {
        connection.release();
        if (err) throw err;
        res.send(JSON.stringify(rows));
      });
    });
  },
}
