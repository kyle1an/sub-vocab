import express from 'express'
import type { RowDataPacket } from 'mysql2'
import { pool } from '../config/connection'
import { tokenChecker, tokenInvalid } from '../lib/timeUtil'

const router = express.Router()
/* GET users listing. */

router.get('/', (req, res, next) => {
  res.send('respond with a resource')
})

router.post('/queryWords', async (req, res) => {
  let { user } = req.body
  if (user && await tokenInvalid(req, res, req.body.acct)) user = ''
  pool.getConnection((err, connection) => {
    connection.query<RowDataPacket[]>(`CALL words_from_user(get_user_id_by_name('${user}'));
    `, (err, rows, fields) => {
      connection.release()
      if (err) throw err
      res.send(JSON.stringify(rows[0]))
    })
  })
})

router.post('/stemsMapping', async (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query<RowDataPacket[]>(`CALL stem_derivation_map();
    `, (err, rows, fields) => {
      connection.release()
      if (err) throw err
      res.send(JSON.stringify(rows[0]))
    })
  })
})

const acquaint = async (word: string, userid: string) => await pool.promise().query<RowDataPacket[]>(`CALL acquaint_vocab('${word}', ${userid});`)

router.post('/acquaint', tokenChecker, async (req, res) => {
  const { word, user } = req.body
  const [rows] = await acquaint(word, `get_user_id_by_name('${user}')`)
  res.send(JSON.stringify(rows))
})

router.post('/acquaintWords', tokenChecker, async (req, res) => {
  const { words, user } = req.body
  const [rows] = await pool.promise().query<RowDataPacket[]>(`select get_user_id_by_name('${user}') as username;`)
  const { username } = rows[0]
  const resMap = (<string[]>words).map((word) => acquaint(word, username))
  Promise.all(resMap).then(() => {
    res.send(JSON.stringify('success'))
  })
})

router.post('/revokeWord', tokenChecker, async (req, res) => {
  const { word, user } = req.body
  pool.getConnection((err, connection) => {
    connection.query(`CALL revoke_vocab_record('${word}', get_user_id_by_name('${user}'));
    `, (err, rows, fields) => {
      connection.release()
      if (err) throw err
      res.send(JSON.stringify(rows))
    })
  })
})

export default router
