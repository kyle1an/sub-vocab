const express = require('express');
const router = express.Router();
const sql = require('../lib/sql');
const config = require('../config/connection');
const mysql = require('mysql');
const pool = mysql.createPool(config);

module.exports = {
  login: (req, res) => {
    pool.getConnection((err, connection) => {
      const { username, password } = req.body;

      connection.query(sql.login({ username, password }), (err, rows, fields) => {
        connection.release();
        if (err) throw err;
        res.send(JSON.stringify(rows));
      })
    })
  },
}
