const express = require('express');
const router = express.Router();
const sql = require('../lib/sql');
const config = require('../config/connection');
const mysql = require('mysql2');
const pool = mysql.createPool(config);

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

module.exports = router;

module.exports.queryWords = async (req, res) => {
  pool.getConnection((err, connection) => {
    const { user } = req.body;
    connection.query(`
    CALL words_of_user(get_user_id_by_name('${user}'));
    `, (err, rows, fields) => {
      connection.release();
      if (err) throw err;
      res.send(JSON.stringify(rows[0]));
    });
  });
}

module.exports.acquaint = (req, res) => {
  pool.getConnection((err, connection) => {
    const { word, user } = req.body;
    connection.query(`
    CALL acquaint_word_record(get_vocab_id('${word}'), get_user_id_by_name('${user}'));
    `, (err, rows, fields) => {
      connection.release();
      if (err) throw err;
      res.send(JSON.stringify(rows));
    });
  });
}

module.exports.revokeWord = (req, res) => {
  pool.getConnection((err, connection) => {
    const { word, user } = req.body;
    connection.query(`
    CALL revoke_word_record(get_vocab_id('${word}'), get_user_id_by_name('${user}'));
    `, (err, rows, fields) => {
      connection.release();
      if (err) throw err;
      res.send(JSON.stringify(rows));
    });
  });
}
