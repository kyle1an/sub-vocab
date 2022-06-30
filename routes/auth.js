const { pool } = require('../config/connection');
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
        response[1] = token
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
    const { username, newUsername, acct, } = req.body;
    connection.query(`
    SELECT change_username(get_user_id_by_name('${username}'), '${newUsername}') as result;
    `, (err, rows, fields) => {
      connection.release();
      if (err) throw err;
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
    const { username, newPassword, oldPassword, acct, } = req.body;
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
    const { username, acct, } = req.body;
    const response = {}
    if (!req.cookies.acct) {
      response.success = false;
      return res.send(JSON.stringify(response));
    }
    connection.query(`
    CALL logout_token(get_user_id_by_name('${username}'), '${req.cookies.acct}');
    `, (err, rows, fields) => {
      connection.release();
      if (err) throw err;
      const rowCount = rows.affectedRows;
      if (rowCount) {
        res.clearCookie('acct', { path: '/' })
        res.clearCookie('_user', { path: '/' })
      }
      response.success = !!rowCount;
      res.send(JSON.stringify(response));
    })
  })
}

module.exports.existsUsername = (req, res) => {
  pool.getConnection((err, connection) => {
    const { username } = req.body;
    connection.query(`
    CALL username_exists('${username}');
    `, (err, rows, fields) => {
      connection.release();
      if (err) throw err;
      const result = { has: rows[0][0].does_exist }
      res.send(JSON.stringify(result));
    })
  })
}
