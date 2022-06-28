const sql = require('../lib/sql');
const config = require('../config/connection');
const mysql = require('mysql2');
const pool = mysql.createPool(config);
const { daysIn } = require('../lib/timeUtil.js')
const crypto = require('crypto');

module.exports.login = (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  pool.getConnection((err, connection) => {
    const { username, password } = req.body;

    connection.query(`
    SELECT login_token('${username}', '${password}', '${token}') AS output;
    `, (err, rows, fields) => {
      connection.release();
      if (err) throw err;
      const response = []
      if (rows[0].output) {
        res.cookie('acct', token, { expires: daysIn(30), httpOnly: true, path: '/' });
        console.log('cookie created successfully');
        response[0] = true
      }
      res.send(JSON.stringify(response));
    })
  })
}

module.exports.register = (req, res) => {
  pool.getConnection((err, connection) => {
    const { username, password } = req.body;

    connection.query(`
    SELECT user_register('${username}', '${password}') as result;
    `, (err, rows, fields) => {
      connection.release();
      if (err) throw err;
      res.send(JSON.stringify(rows));
    })
  })
}

module.exports.changeUsername = (req, res) => {
  pool.getConnection((err, connection) => {
    const { username, newUsername } = req.body;
    connection.query(`
    SELECT change_username(get_user_id_by_name('${username}'), '${newUsername}') as result;
    `, (err, rows, fields) => {
      connection.release();
      if (err) throw err;
      console.log('change_username', rows);
      const result = {}
      if (rows[0].result) {
        result.success = true;
      }
      res.send(JSON.stringify(result));
    })
  })
}

module.exports.changePassword = (req, res) => {
  pool.getConnection((err, connection) => {
    const { username, newPassword, oldPassword } = req.body;
    connection.query(`
    CALL change_password(get_user_id_by_name('${username}'), '${newPassword}', '${oldPassword}');
    `, (err, rows, fields) => {
      connection.release();
      if (err) throw err;
      const result = {}
      if (rows.affectedRows) {
        result.success = true;
      }
      res.send(JSON.stringify(result));
    })
  })
}

module.exports.logout = (req, res) => {
  pool.getConnection((err, connection) => {
    const { username } = req.body;
    connection.query(`
    SELECT logout(get_user_id_by_name('${username}'));
    `, (err, rows, fields) => {
      connection.release();
      if (err) throw err;
      if (rows[0].length) {
        if (req.cookies.acct === undefined) {
          res.cookie('acct', '', { expires: 'Thu, 01 Jan 1970 00:00:01 GMT', httpOnly: true, });
          console.log('cookie created successfully');
        }
      }
      res.send(JSON.stringify(rows[0]));
    })
  })
}
