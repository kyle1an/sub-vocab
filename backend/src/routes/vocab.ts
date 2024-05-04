import express from 'express'
import type { Request, Response } from 'express-serve-static-core'
import { LRUCache } from 'lru-cache'
import { isTokenValid, tokenChecker } from '../utils/util'
import type { AcquaintWordsResponse, LabelDB, StemsMapping, ToggleWordResponse, UserVocab, Username } from '../types'
import { acquaintWords, getUserWords, revokeWords, stemsMapping } from '../services/vocabulary'
import { io } from '../../app'
import type { CookiesObj } from './auth'

const router = express.Router()
/* GET user listing. */

router.get('/', (req, res, next) => {
  res.send('respond with a resource')
})

router.post('/queryWords', (req: Request<{}, {}, Username>, res: Response<LabelDB[]>) => {
  const { _user = '', acct = '' } = req.cookies as CookiesObj
  isTokenValid(_user, acct)
    .then(async (isValid) => {
      let user = ''
      if (isValid) {
        user = req.body.username
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

router.post('/stemsMapping', (req, res: Response<StemsMapping>) => {
  getStemsMapping()
    .then((derivation) => {
      if (derivation) {
        res.json(derivation)
      }
    })
    .catch(console.error)
})

router.post('/acquaintWords', tokenChecker, (req: Request<{}, {}, UserVocab>, res: Response<AcquaintWordsResponse>) => {
  const { words, username } = req.body
  acquaintWords(words, username)
    .then((acquaintWordsResult) => {
      if (acquaintWordsResult) {
        res.json(acquaintWordsResult)
        io.to(username).emit('acquaintWords', { words })
      }
    })
    .catch(console.error)
})

router.post('/revokeWord', tokenChecker, (req: Request<{}, {}, UserVocab>, res: Response<ToggleWordResponse>) => {
  const { words, username } = req.body
  revokeWords(words, username)
    .then((revokeWordsResult) => {
      if (revokeWordsResult) {
        res.json(revokeWordsResult)
        io.to(username).emit('revokeWord', { words })
      }
    })
    .catch(console.error)
})

export default router
