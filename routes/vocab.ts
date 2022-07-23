import express from 'express'
import { pool } from '../config/connection'
import { isTokenInvalid } from '../lib/timeUtil'

const router = express.Router()
/* GET users listing. */

router.get('/', (req, res, next) => {
  res.send('respond with a resource')
})

router.post('/queryWords', async (req, res) => {
  const { user, acct } = req.body
  let realUser = user
  if (realUser && await isTokenInvalid(req, res, acct)) realUser = ''
  pool.getConnection((err, connection) => {
    connection.query(`CALL words_from_user(get_user_id_by_name('${realUser}'));
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

router.post('/acquaint', async (req, res) => {
  const { word, user, acct } = req.body
  if (await isTokenInvalid(req, res, acct)) return res.send(JSON.stringify({ affectedRows: 0, message: 'Invalid' }))
  pool.getConnection((err, connection) => {
    connection.query(`CALL acquaint_vocab('${word}', get_user_id_by_name('${user}'));
    `, (err, rows, fields) => {
      connection.release()
      if (err) throw err
      res.send(JSON.stringify(rows))
    })
  })
})

router.post('/revokeWord', async (req, res) => {
  const { word, user, acct } = req.body
  if (await isTokenInvalid(req, res, acct)) return res.send(JSON.stringify({ affectedRows: 0, message: 'Invalid' }))
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
