import express from 'express'
import mysql from 'mysql2'
import type { Response } from 'express-serve-static-core'
import { type RSH, sql } from '../config/connection'
import { tokenChecker, tokenInvalid } from '../utils/util'
import type { RequestBody } from '../types'
import type { AcquaintWordsResponse, LabelDB, StemsMapping, ToggleWordResponse } from '../../ui/src/types/shared'
import type { UserVocab } from '../../ui/src/api/vocab-api'
import type { Username } from '../../ui/src/api/user'

interface Stems {
  derived_word: string
  stem_word: string
}

const router = express.Router()
/* GET user listing. */

router.get('/', (req, res, next) => {
  res.send('respond with a resource')
})

router.post('/queryWords', async (req: RequestBody<Username>, res: Response<LabelDB[]>) => {
  const user = await tokenInvalid(req, res) ? '' : req.body.username
  sql<RSH<LabelDB[]>>`CALL words_from_user(get_user_id_by_name(${user}));`
    .then(([rows]) => {
      res.json(rows[0])
    })
    .catch((err) => {
      throw new Error(err)
    })
})

router.post('/stemsMapping', async (req: RequestBody, res: Response<StemsMapping>) => {
  sql<RSH<Stems[]>>`CALL stem_derivation_link();`
    .then(([rows]) => {
      const map: Record<string, string[]> = {}
      rows[0].forEach((link) => {
        map[link.stem_word] ??= [link.stem_word]
        map[link.stem_word].push(link.derived_word)
      })

      res.json(Object.values(map))
    })
    .catch((err) => {
      throw new Error(err)
    })
})

router.post('/acquaintWords', tokenChecker, async (req: RequestBody<UserVocab>, res: Response<AcquaintWordsResponse>) => {
  const { words, username } = req.body
  Promise.all(words.map((word) => sql<mysql.ResultSetHeader>`CALL acquaint_vocab(${word}, get_user_id_by_name(${username}));`))
    .then(() => {
      res.json('success')
    })
    .catch((err) => {
      throw new Error(err)
    })
})

router.post('/revokeWord', tokenChecker, async (req: RequestBody<UserVocab>, res: Response<ToggleWordResponse>) => {
  const { words, username } = req.body
  Promise.all(words.map((word) => sql<mysql.ResultSetHeader>`CALL revoke_vocab_record(${word}, get_user_id_by_name(${username}));`))
    .then(() => {
      res.json('success')
    })
    .catch((err) => {
      throw new Error(err)
    })
})

export default router
