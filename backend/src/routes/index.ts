import express from 'express'

const router = express.Router()

router.get('/', function (req, res, next) {
  res.send('API is running')
})

export default router
