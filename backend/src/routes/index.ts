import express from 'express'

import authRouter from './auth.js'

const router = express.Router()

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

router.use('/', authRouter)

export default router
