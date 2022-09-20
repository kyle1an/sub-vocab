import type { NextFunction, Request, Response } from 'express'
import type { RowDataPacket } from 'mysql2'
import { pool } from '../config/connection'

export function daysIn(days: number) {
  const date = new Date()
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
  return date
}

export async function tokenInvalid(req: Request, res: Response, acct: string) {
  const username = req.body?.username || req.body?.user
  const [rows] = await pool.promise().query<RowDataPacket[]>(`SELECT token_check('${acct}', get_user_id_by_name('${username}')) as result;`)
  return !rows[0].result
}

export async function tokenChecker(req: Request, res: Response, next: NextFunction) {
  if (await tokenInvalid(req, res, req.body.acct)) {
    return res.send(JSON.stringify({ affectedRows: 0, message: 'Invalid' }))
  } else {
    next()
  }
}
