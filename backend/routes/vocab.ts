import express from 'express'
import type { FieldPacket, OkPacket, ResultSetHeader } from 'mysql2'
import { pool } from '../config/connection'
import { tokenChecker, tokenInvalid } from '../lib/timeUtil'
import type { UserVocab, UserVocabs } from '../../ui/src/types'
import type { RequestBody, TypedResponse } from '../types'
import type { User } from '../../ui/src/api/vocab-service'

export interface LabelFromUser extends Record<string, unknown> {
  w: string;
  acquainted: number | boolean,
  is_user: number | boolean,
  original: number | boolean,
  rank: number | null,
  time_modified: string | null,
}

interface Stems {
  derived_word: string,
  stem_word: string,
}

const router = express.Router()
/* GET user listing. */

router.get('/', (req, res, next) => {
  res.send('respond with a resource')
})

router.post('/queryWords', async (req: RequestBody<User>, res: TypedResponse<LabelFromUser[]>) => {
  const user = await tokenInvalid(req, res) ? '' : req.body.user
  pool.getConnection((err, connection) => {
    connection.query(
      `CALL words_from_user(get_user_id_by_name('${user}'));`,
      function (err, rows: [LabelFromUser[], OkPacket | ResultSetHeader], fields) {
        connection.release()
        if (err) throw err
        res.json(rows[0])
      }
    )
  })
})
export type StemsMapping = string[][]
router.post('/stemsMapping', async (req: RequestBody, res: TypedResponse<StemsMapping>) => {
  try {
    const [rows]: [[Stems[], OkPacket | ResultSetHeader], FieldPacket[]] = await pool.promise()
      .query(`CALL stem_derivation_link();`)
    const map: Record<string, string[]> = {}
    rows[0].forEach((link) => {
      map[link.stem_word] ??= [link.stem_word]
      map[link.stem_word].push(link.derived_word)
    })

    res.json(Object.values(map))
  } catch (err) {
    throw new Error(err)
  }
})

async function acquaint(word: string, userid: string) {
  return await pool.promise().query(`CALL acquaint_vocab('${word}', ${userid});`)
}

router.post('/acquaint', tokenChecker, async (req: RequestBody<UserVocab>, res) => {
  const { word, user } = req.body
  const [rows] = await acquaint(word, `get_user_id_by_name('${user}')`)
  res.json(rows)
})
export type AcquaintWordsResponse = string
router.post('/acquaintWords', tokenChecker, async (req: RequestBody<UserVocabs>, res: TypedResponse<AcquaintWordsResponse>) => {
  const { words, user } = req.body
  try {
    const [rows] = await pool.promise().query(`select get_user_id_by_name('${user}') as username;`)
    const resMap = words.map((word) => acquaint(word, rows[0].username))
    Promise.all(resMap).then(() => {
      res.json('success')
    })
  } catch (err) {
    throw new Error(err)
  }
})
export type ToggleWordResponse = OkPacket | ResultSetHeader
router.post('/revokeWord', tokenChecker, async (req: RequestBody<UserVocab>, res: TypedResponse<ToggleWordResponse>) => {
  const { word, user } = req.body
  try {
    const [rows] = await pool.promise().query(`CALL revoke_vocab_record('${word}', get_user_id_by_name('${user}'));`)
    res.json(rows)
  } catch (err) {
    throw new Error(err)
  }
})

export default router