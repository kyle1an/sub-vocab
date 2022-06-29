const { pool } = require('../config/connection');
module.exports.daysIn = (days) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  return date;
}

module.exports.isTokenInvalid = async (req) => {
  const username = req.body?.username || req.body?.user;
  const token = req.cookies.acct;
  const [rows] = await pool.promise().query(`
SELECT token_check('${token}', get_user_id_by_name('${username}')) as result;
`);
  return !rows[0].result;
}
