import crypto from 'crypto'
import express from 'express'
import type { OkPacket, ResultSetHeader } from 'mysql2'
import { pool } from '../config/connection'
import { daysIn, tokenChecker } from '../lib/timeUtil'
import type { RequestBody, Status, TypedResponse } from '../types'
import type { Credential, NewCredential, NewUsername, Username } from '../../ui/src/api/user'

const router = express.Router()

export type LoginResponse = [boolean]

router.post('/login', (req: RequestBody<Credential>, res: TypedResponse<LoginResponse>) => {
  const token = crypto.randomBytes(32).toString('hex')
  pool.getConnection((err, connection) => {
    const { username, password } = req.body
    connection.query(
      `SELECT login_token('${username}', '${password}', '${token}') AS output;`,
      function (err, rows: [{ output: number }, OkPacket | ResultSetHeader], fields) {
        connection.release()
        if (err) throw err
        const response: [boolean] = [false]
        if (rows[0].output) {
          res.cookie('_user', username, { expires: daysIn(30) })
          res.cookie('acct', token, { expires: daysIn(30) })
          response[0] = true
        }
        res.json(response)
      }
    )
  })
})

export type RegisterResponse = [{ result: number }]

router.post('/register', (req: RequestBody<Credential>, res: TypedResponse<RegisterResponse>) => {
  pool.getConnection((err, connection) => {
    const { username, password } = req.body
    connection.query(
      `SELECT user_register('${username}', '${password}') as result;`,
      function (err, rows: RegisterResponse, fields) {
        connection.release()
        if (err) throw err
        res.json(rows)
      }
    )
  })
})

router.post('/changeUsername', tokenChecker, (req: RequestBody<NewUsername>, res: TypedResponse<Status>) => {
  pool.getConnection((err, connection) => {
    const { username, newUsername } = req.body
    connection.query(
      `SELECT change_username(get_user_id_by_name('${username}'), '${newUsername}') as result;`,
      function (err, rows: RegisterResponse, fields) {
        connection.release()
        if (err) throw err
        res.json({
          success: !!rows[0].result
        })
      }
    )
  })
})

router.post('/changePassword', (req: RequestBody<NewCredential>, res: TypedResponse<Status>) => {
  pool.getConnection((err, connection) => {
    const { username, newPassword, oldPassword } = req.body
    connection.query(
      `CALL change_password(get_user_id_by_name('${username}'), '${newPassword}', '${oldPassword}');`,
      function (err, rows, fields) {
        connection.release()
        if (err) throw err
        res.json({
          success: !!('affectedRows' in rows && rows.affectedRows)
        })
      }
    )
  })
})

router.post('/logoutToken', (req: RequestBody<Username>, res: TypedResponse<Status>) => {
  pool.getConnection((err, connection) => {
    const { username } = req.body
    if (!req.cookies.acct) {
      return res.json({ success: false })
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
        res.json({ success: !!rowCount })
      }
    )
  })
})

export interface UsernameTaken {
  has: boolean
}

router.post('/existsUsername', (req: RequestBody<Username>, res: TypedResponse<UsernameTaken>) => {
  pool.getConnection((err, connection) => {
    const { username } = req.body
    connection.query(
      `CALL username_exists('${username}');`,
      function (err, rows: [[{ does_exist: number }], OkPacket | ResultSetHeader], fields) {
        connection.release()
        if (err) throw err
        res.json({ has: !!rows[0][0].does_exist })
      }
    )
  })
})

export default router
