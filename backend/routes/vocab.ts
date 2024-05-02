import express from 'express'
import type { ParamsDictionary, Request, Response } from 'express-serve-static-core'
import { LRUCache } from 'lru-cache'
import { tokenChecker, tokenInvalid } from '../utils/util'
import type { AcquaintWordsResponse, LabelDB, StemsMapping, ToggleWordResponse } from '../../ui/src/types/shared'
import type { UserVocab } from '../../ui/src/api/vocab-api'
import type { Username } from '../../ui/src/api/user'
import { acquaintWords, getUserWords, revokeWords, stemsMapping } from '../services/vocabulary'

const router = express.Router()
/* GET user listing. */

router.get('/', (req, res, next) => {
  res.send('respond with a resource')
})

router.post('/queryWords', (req: Request<ParamsDictionary, {}, Username>, res: Response<LabelDB[]>) => {
  tokenInvalid(req, res)
    .then(async (isInvalid) => {
      let user = req.body.username
      if (isInvalid) {
        user = ''
      }
      const words = await getUserWords(user)
      res.json(words)
    })
    .catch(console.error)
})

const cache = new LRUCache({
  max: 500,
  maxSize: 5000,
  sizeCalculation: () => {
    return 1
  },
  ttl: 1000 * 60 * 60 * 24,
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
  fetchMethod: stemsMapping,
})

async function getStemsMapping(key = 'mappings') {
  if (!cache.has(key)) {
    await cache.fetch(key)
  }

  return cache.get(key)
}

router.post('/stemsMapping', (req: Request<ParamsDictionary, StemsMapping>, res) => {
  getStemsMapping()
    .then((derivation) => {
      if (derivation) {
        res.json(derivation)
      }
    })
    .catch(console.error)
})

router.post('/acquaintWords', tokenChecker, (req: Request<ParamsDictionary, {}, UserVocab>, res: Response<AcquaintWordsResponse>) => {
  const { words, username } = req.body
  acquaintWords(words, username)
    .then((acquaintWordsResult) => {
      if (acquaintWordsResult) {
        res.json(acquaintWordsResult)
      }
    })
    .catch(console.error)
})

router.post('/revokeWord', tokenChecker, (req: Request<ParamsDictionary, {}, UserVocab>, res: Response<ToggleWordResponse>) => {
  const { words, username } = req.body
  revokeWords(words, username)
    .then((revokeWordsResult) => {
      if (revokeWordsResult) {
        res.json(revokeWordsResult)
      }
    })
    .catch(console.error)
})

export default router
