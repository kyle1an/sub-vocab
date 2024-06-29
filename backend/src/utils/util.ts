import type { NextFunction, Request, Response } from 'express'
import { sql } from '../config/connection.js'
import type { CookiesObj } from '../routes/auth.js'

export async function isTokenValid(_user: string, acct: string) {
  if (!_user) {
    return false
  }
  const [rows] = await sql<[{ result: number }]>`SELECT token_check(${acct}, get_user_id_by_name(${_user})) as result;`
  return Boolean(rows[0].result)
}

export async function tokenChecker(req: Request, res: Response, next: NextFunction) {
  const { _user = '', acct = '' } = req.cookies as CookiesObj
  const isValid = await isTokenValid(_user, acct)
  if (!isValid) {
    return res.json({ affectedRows: 0, message: 'Invalid' })
  } else {
    next()
  }
}
