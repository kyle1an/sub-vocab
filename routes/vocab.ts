import express from 'express'
import type { RowDataPacket } from 'mysql2'
import { pool } from '../config/connection'
import { tokenChecker, tokenInvalid } from '../lib/timeUtil'
import type { Stems } from '../types'

const router = express.Router()
/* GET user listing. */

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
  try {
    const [rows] = await pool.promise().query<RowDataPacket[]>(`CALL stem_derivation_map();`)
    const stems = rows[0].map((m: Stems) => [m.stem_word, ...m.derivations.split(',')])
    res.send(JSON.stringify(stems))
  } catch (err) {
    throw new Error(err)
  }
})

const acquaint = async (word: string, userid: string) => await pool.promise().query<RowDataPacket[]>(`CALL acquaint_vocab('${word}', ${userid});`)

router.post('/acquaint', tokenChecker, async (req, res) => {
  const { word, user } = req.body
  const [rows] = await acquaint(word, `get_user_id_by_name('${user}')`)
  res.send(JSON.stringify(rows))
})

router.post('/acquaintWords', tokenChecker, async (req, res) => {
  try {
    const { words, user } = req.body
    const [rows] = await pool.promise().query<RowDataPacket[]>(`select get_user_id_by_name('${user}') as username;`)
    const { username } = rows[0]
    const resMap = (<string[]>words).map((word) => acquaint(word, username))
    Promise.all(resMap).then(() => {
      res.send(JSON.stringify('success'))
    })
  } catch (err) {
    throw new Error(err)
  }
})

router.post('/revokeWord', tokenChecker, async (req, res) => {
  try {
    const { word, user } = req.body
    const [rows] = await pool.promise().query(`CALL revoke_vocab_record('${word}', get_user_id_by_name('${user}'));`)
    res.send(JSON.stringify(rows as RowDataPacket[]))
  } catch (err) {
    throw new Error(err)
  }
})

export default router
