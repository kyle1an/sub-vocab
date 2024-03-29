import type { NextFunction, Request, Response } from 'express-serve-static-core'
import { sql } from '../config/connection'

export async function tokenInvalid(req: Request, res: Response) {
  if (!req.cookies._user) return true
  const [rows] = await sql<[{ result: number }]>`SELECT token_check(${req.cookies.acct}, get_user_id_by_name(${req.cookies._user})) as result;`
  return !rows[0].result
}

export async function tokenChecker(req: Request, res: Response, next: NextFunction) {
  if (await tokenInvalid(req, res)) {
    return res.json({ affectedRows: 0, message: 'Invalid' })
  } else {
    next()
  }
}
