import crypto from 'crypto'
import express from 'express'
import mysql from 'mysql2'
import type { Response } from 'express-serve-static-core'
import { type RSH, sql } from '../config/connection'
import { daysIn, tokenChecker } from '../utils/util'
import type { RequestBody } from '../types'
import type { LoginResponse, RegisterResponse, Status, UsernameTaken } from '../../ui/src/types/shared'
import type { Credential, NewCredential, NewUsername, Username } from '../../ui/src/api/user'

const router = express.Router()

router.post('/login', (req: RequestBody<Credential>, res: Response<LoginResponse>) => {
  const token = crypto.randomBytes(32).toString('hex')
  const { username, password } = req.body
  sql<[{ output: number }]>`SELECT login_token(${username}, ${password}, ${token}) AS output;`
    .then(([rows]) => {
      const response: [boolean] = [false]
      if (rows[0].output) {
        res.cookie('_user', username, { expires: daysIn(30) })
        res.cookie('acct', token, { expires: daysIn(30) })
        response[0] = true
      }
      res.json(response)
    })
    .catch((err) => {
      throw new Error(err)
    })
})

router.post('/register', (req: RequestBody<Credential>, res: Response<RegisterResponse>) => {
  const { username, password } = req.body
  sql<RegisterResponse>`SELECT user_register(${username}, ${password}) as result;`
    .then(([rows]) => {
      res.json([rows[0]])
    })
    .catch((err) => {
      throw new Error(err)
    })
})

router.post('/changeUsername', tokenChecker, (req: RequestBody<NewUsername>, res: Response<Status>) => {
  const { username, newUsername } = req.body
  sql<RegisterResponse>`SELECT change_username(get_user_id_by_name(${username}), ${newUsername}) as result;`
    .then(([rows]) => {
      res.cookie('_user', newUsername, { expires: daysIn(30) })
      res.json({
        success: !!rows[0].result,
      })
    })
    .catch((err) => {
      throw new Error(err)
    })
})

router.post('/changePassword', (req: RequestBody<NewCredential>, res: Response<Status>) => {
  const { username, newPassword, oldPassword } = req.body
  sql<mysql.ResultSetHeader>`CALL change_password(get_user_id_by_name(${username}), ${newPassword}, ${oldPassword});`
    .then(([rows]) => {
      res.json({
        success: !!('affectedRows' in rows && rows.affectedRows),
      })
    })
    .catch((err) => {
      throw new Error(err)
    })
})

router.post('/logoutToken', (req: RequestBody<Username>, res: Response<Status>) => {
  const { username } = req.body
  if (!req.cookies.acct) {
    return res.json({ success: false })
  }
  sql<mysql.ResultSetHeader>`CALL logout_token(get_user_id_by_name(${username}), ${req.cookies.acct});`
    .then(([rows]) => {
      const rowCount = 'affectedRows' in rows ? rows.affectedRows : 0
      if (rowCount) {
        res.clearCookie('acct', { path: '/' })
        res.clearCookie('_user', { path: '/' })
      }
      res.json({ success: !!rowCount })
    })
    .catch((err) => {
      throw new Error(err)
    })
})

router.post('/existsUsername', (req: RequestBody<Username>, res: Response<UsernameTaken>) => {
  const { username } = req.body
  sql<RSH<[{ does_exist: number }]>>`CALL username_exists(${username});`
    .then(([rows]) => {
      res.json({ has: !!rows[0][0].does_exist })
    })
    .catch((err) => {
      throw new Error(err)
    })
})

export default router
