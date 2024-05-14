import crypto from 'node:crypto'
import express from 'express'
import type mysql from 'mysql2'
import type { ParamsDictionary, Request, Response } from 'express-serve-static-core'
import { addDays } from 'date-fns'
import { sql } from '../config/connection.js'
import { tokenChecker } from '../utils/util.js'
import type { Credential, LoginResponse, NewCredential, NewUsername, RegisterResponse, Status, Username, UsernameTaken } from '../types'

const router = express.Router()

export type CookiesObj = Partial<{
  _user: string
  acct: string
}>

router.post('/login', (req: Request<ParamsDictionary, LoginResponse, Credential>, res) => {
  const token = crypto.randomBytes(32).toString('hex')
  const { username, password } = req.body
  sql<[{ output: number }]>`SELECT login_token(${username}, ${password}, ${token}) AS output;`
    .then(([rows]) => {
      const response: [boolean] = [false]
      if (rows[0].output) {
        const expires = addDays(Date.now(), 30)
        res.cookie('_user', username, { expires })
        res.cookie('acct', token, { expires })
        response[0] = true
      }
      res.json(response)
    })
    .catch(console.error)
})

router.post('/register', (req: Request<ParamsDictionary, RegisterResponse, Credential>, res) => {
  const { username, password } = req.body
  sql<RegisterResponse>`SELECT user_register(${username}, ${password}) as result;`
    .then(([rows]) => {
      res.json([rows[0]])
    })
    .catch(console.error)
})

router.post('/changeUsername', tokenChecker, (req: Request<ParamsDictionary, Status, NewUsername>, res: Response) => {
  const { username, newUsername } = req.body
  sql<RegisterResponse>`SELECT change_username(get_user_id_by_name(${username}), ${newUsername}) as result;`
    .then(([rows]) => {
      const expires = addDays(Date.now(), 30)
      res.cookie('_user', newUsername, { expires })
      res.json({
        success: !!rows[0].result,
      })
    })
    .catch(console.error)
})

router.post('/changePassword', (req: Request<ParamsDictionary, Status, NewCredential>, res) => {
  const { username, newPassword, oldPassword } = req.body
  sql<mysql.ResultSetHeader>`CALL change_password(get_user_id_by_name(${username}), ${newPassword}, ${oldPassword});`
    .then(([rows]) => {
      res.json({
        success: !!('affectedRows' in rows && rows.affectedRows),
      })
    })
    .catch(console.error)
})

router.post('/logoutToken', (req: Request<ParamsDictionary, Status, Username>, res) => {
  const { username } = req.body
  const { acct } = req.cookies as CookiesObj
  if (!acct) {
    return res.json({ success: false })
  }
  sql<mysql.ResultSetHeader>`CALL logout_token(get_user_id_by_name(${username}), ${acct});`
    .then(([rows]) => {
      const rowCount = 'affectedRows' in rows ? rows.affectedRows : 0
      if (rowCount) {
        res.clearCookie('acct', { path: '/' })
        res.clearCookie('_user', { path: '/' })
      }
      res.json({ success: !!rowCount })
    })
    .catch(console.error)
})

router.post('/existsUsername', (req: Request<ParamsDictionary, UsernameTaken, Username>, res) => {
  const { username } = req.body
  sql<[{ does_exist: number }]>`
  SELECT count(*) does_exist from users where username = ${username};`
    .then(([rows]) => {
      res.json({ has: !!rows[0].does_exist })
    })
    .catch(console.error)
})

export default router
