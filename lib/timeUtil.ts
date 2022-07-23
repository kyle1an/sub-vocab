import { pool } from '../config/connection'

export function daysIn(days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  return date;
}

export async function isTokenInvalid(req, res, acct) {
  const username = req.body?.username || req.body?.user;
  const [rows] = await pool.promise().query(`SELECT token_check('${acct}', get_user_id_by_name('${username}')) as result;`);
  return !rows[0].result;
}
