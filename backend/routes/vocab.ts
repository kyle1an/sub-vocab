import express from 'express'
import type { ParamsDictionary, Request } from 'express-serve-static-core'
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

router.post('/queryWords', async (req: Request<ParamsDictionary, LabelDB[], Username>, res) => {
  const user = await tokenInvalid(req, res) ? '' : req.body.username
  const words = await getUserWords(user)
  res.json(words)
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

router.post('/stemsMapping', async (req: Request<ParamsDictionary, StemsMapping>, res) => {
  const derivation = await getStemsMapping()
  if (derivation) {
    res.json(derivation)
  }
})

router.post('/acquaintWords', tokenChecker, async (req: Request<ParamsDictionary, AcquaintWordsResponse, UserVocab>, res) => {
  const { words, username } = req.body
  const acquaintWordsResult = await acquaintWords(words, username)
  if (acquaintWordsResult) {
    res.json(acquaintWordsResult)
  }
})

router.post('/revokeWord', tokenChecker, async (req: Request<ParamsDictionary, ToggleWordResponse, UserVocab>, res) => {
  const { words, username } = req.body
  const revokeWordsResult = await revokeWords(words, username)
  if (revokeWordsResult) {
    res.json(revokeWordsResult)
  }
})

export default router
