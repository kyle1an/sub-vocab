import crypto from 'crypto'
import express from 'express'
import type { RowDataPacket } from 'mysql2'
import { pool } from '../config/connection'
import { daysIn, tokenChecker } from '../lib/timeUtil'

const router = express.Router()
router.post('/login', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex')
  pool.getConnection((err, connection) => {
    const { username, password } = req.body
    connection.query<RowDataPacket[]>(
      `SELECT login_token('${username}', '${password}', '${token}') AS output;`,
      function (err, rows, fields) {
        connection.release()
        if (err) throw err
        const response = []
        if (rows[0].output) {
          res.cookie('_user', username, { expires: daysIn(30) })
          res.cookie('acct', token, { expires: daysIn(30) })
          response[0] = true
        }
        res.send(JSON.stringify(response))
      }
    )
  })
})

router.post('/register', (req, res) => {
  pool.getConnection((err, connection) => {
    const { username, password } = req.body
    connection.query(
      `SELECT user_register('${username}', '${password}') as result;`,
      function (err, rows, fields) {
        connection.release()
        if (err) throw err
        res.send(JSON.stringify(rows))
      }
    )
  })
})

router.post('/changeUsername', tokenChecker, (req, res) => {
  pool.getConnection((err, connection) => {
    const { username, newUsername } = req.body
    connection.query<RowDataPacket[]>(
      `SELECT change_username(get_user_id_by_name('${username}'), '${newUsername}') as result;`,
      function (err, rows, fields) {
        connection.release()
        if (err) throw err
        const result = { success: false }
        if (rows[0].result) {
          result.success = true
        }
        res.send(JSON.stringify(result))
      }
    )
  })
})

router.post('/changePassword', (req, res) => {
  pool.getConnection((err, connection) => {
    const { username, newPassword, oldPassword } = req.body
    connection.query(
      `CALL change_password(get_user_id_by_name('${username}'), '${newPassword}', '${oldPassword}');`,
      function (err, rows, fields) {
        connection.release()
        if (err) throw err
        const result = { success: false }
        if ('affectedRows' in rows && rows.affectedRows) {
          result.success = true
        }
        res.send(JSON.stringify(result))
      }
    )
  })
})

router.post('/logoutToken', (req, res) => {
  pool.getConnection((err, connection) => {
    const { username } = req.body
    const response = { success: false }
    if (!req.cookies.acct) {
      return res.send(JSON.stringify(response))
    }
    connection.query(
      `CALL logout_token(get_user_id_by_name('${username}'), '${req.cookies.acct}');`,
      function (err, rows, fields) {
        connection.release()
        if (err) throw err
        const rowCount = 'affectedRows' in rows ? rows.affectedRows : 0
        if (rowCount) {
          res.clearCookie('acct', { path: '/' })
          res.clearCookie('_user', { path: '/' })
        }
        response.success = !!rowCount
        res.send(JSON.stringify(response))
      }
    )
  })
})

router.post('/existsUsername', (req, res) => {
  pool.getConnection((err, connection) => {
    const { username } = req.body
    connection.query<RowDataPacket[]>(
      `CALL username_exists('${username}');`,
      function (err, rows, fields) {
        connection.release()
        if (err) throw err
        const result = { has: rows[0][0].does_exist }
        res.send(JSON.stringify(result))
      }
    )
  })
})

export default router
