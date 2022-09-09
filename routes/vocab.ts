import express from 'express'
import { pool } from '../config/connection'
import { isTokenInvalid, tokenChecker } from '../lib/timeUtil'

const router = express.Router()
/* GET users listing. */

router.get('/', (req, res, next) => {
  res.send('respond with a resource')
})

router.post('/queryWords', async (req, res) => {
  let { user } = req.body
  if (user && await isTokenInvalid(req, res, req.body.acct)) user = ''
  pool.getConnection((err, connection) => {
    connection.query(`CALL words_from_user(get_user_id_by_name('${user}'));
    `, (err, rows, fields) => {
      connection.release()
      if (err) throw err
      res.send(JSON.stringify(rows[0]))
    })
  })
})

router.post('/stemsMapping', async (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query(`CALL stem_derivation_map();
    `, (err, rows, fields) => {
      connection.release()
      if (err) throw err
      res.send(JSON.stringify(rows[0]))
    })
  })
})

router.post('/acquaint', tokenChecker, async (req, res) => {
  const { word, user } = req.body
  pool.getConnection((err, connection) => {
    connection.query(`CALL acquaint_vocab('${word}', get_user_id_by_name('${user}'));
    `, (err, rows, fields) => {
      connection.release()
      if (err) throw err
      res.send(JSON.stringify(rows))
    })
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
