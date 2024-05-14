import express from 'express'
import vocabRouter from './vocab.js'
import authRouter from './auth.js'

const router = express.Router()
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

router.use('/', authRouter)
router.use('/api', vocabRouter)

export default router
