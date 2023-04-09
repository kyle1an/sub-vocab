import express from 'express'
import type { FieldPacket, OkPacket, ResultSetHeader } from 'mysql2'
import type { Response } from 'express-serve-static-core'
import { pool } from '../config/connection'
import { tokenChecker, tokenInvalid } from '../lib/timeUtil'
import type { RequestBody } from '../types'
import type { UserVocabs } from '../../ui/src/store/useVocab'
import type { Username } from '../../ui/src/api/user'

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

router.post('/queryWords', async (req: RequestBody<Username>, res: Response<LabelFromUser[]>) => {
  const user = await tokenInvalid(req, res) ? '' : req.body.username
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
router.post('/stemsMapping', async (req: RequestBody, res: Response<StemsMapping>) => {
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

export type AcquaintWordsResponse = string
router.post('/acquaintWords', tokenChecker, async (req: RequestBody<UserVocabs>, res: Response<AcquaintWordsResponse>) => {
  const { words, username } = req.body
  Promise.all(words.map((word) => pool.promise().query(`CALL acquaint_vocab('${word}', get_user_id_by_name('${username}'));`)))
    .then(() => {
      res.json('success')
    })
    .catch((err) => {
      throw new Error(err)
    })
})

export type ToggleWordResponse = string
router.post('/revokeWord', tokenChecker, async (req: RequestBody<UserVocabs>, res: Response<ToggleWordResponse>) => {
  const { words, username } = req.body
  Promise.all(words.map((word) => pool.promise().query(`CALL revoke_vocab_record('${word}', get_user_id_by_name('${username}'));`)))
    .then(() => {
      res.json('success')
    })
    .catch((err) => {
      throw new Error(err)
    })
})

export default router
