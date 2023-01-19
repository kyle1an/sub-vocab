import type { NextFunction, Request, Response } from 'express'
import type { RowDataPacket } from 'mysql2'
import { pool } from '../config/connection'

export const daysIn = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000)

export async function tokenInvalid(req: Request, res: Response) {
  if (!req.cookies._user) return true
  const [rows] = await pool.promise().query<RowDataPacket[]>(`SELECT token_check('${req.cookies.acct}', get_user_id_by_name('${req.cookies._user}')) as result;`)
  return !rows[0].result
}

export async function tokenChecker(req: Request, res: Response, next: NextFunction) {
  if (await tokenInvalid(req, res)) {
    return res.send(JSON.stringify({ affectedRows: 0, message: 'Invalid' }))
  } else {
    next()
  }
}
