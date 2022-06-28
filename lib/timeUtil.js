const mysql = require('mysql2');
const config = require('../config/connection');
const pool = mysql.createPool(config);

module.exports.daysIn = (days) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  return date;
}

module.exports.tokenCheck = async (req, res) => {
  let validity = false;
  const username = req.body?.username || req.body?.user;
  const token = req.cookies.acct;
  console.log(username, token);
  pool.getConnection((err, connection) => {
    const sqlString = `
SELECT token_check('${token}', get_user_id_by_name('${username}')) as result;
`
    connection.query(sqlString, (err, rows, fields) => {
      connection.release();
      if (err) throw err;
      console.log('rows', rows);
      validity = !!rows[0].result;
      console.log('validity1', validity);
    })
  })
  console.log('validity2', validity);
  return validity;
}
