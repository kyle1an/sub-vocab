import { pool } from '../config/connection'
import express from 'express'

export function daysIn(days) {
  const date = new Date()
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
  return date
}

export async function isTokenInvalid(req, res, acct) {
  const username = req.body?.username || req.body?.user
  const [rows] = await pool.promise().query(`SELECT token_check('${acct}', get_user_id_by_name('${username}')) as result;`)
  return !rows[0].result
}

export async function tokenChecker(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (await isTokenInvalid(req, res, req.body.acct)) {
    return res.send(JSON.stringify({ affectedRows: 0, message: 'Invalid' }))
  } else {
    next()
  }
}
