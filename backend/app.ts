import path from 'path'
import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import indexRouter from './routes/index'
import vocabRouter from './routes/vocab'
import authRouter from './routes/auth'

const app = express()
app.use(cors({
  origin: [
    /.*localhost.*$/,
    /.*127.0.0.1.*$/,
    /.*10.207.1.106.*$/,
    /.*198.18.0.1.*$/,
    /.*subvocab.netlify.app/,
    /.*subvocab.*.vercel.app/,
    /.*sub-vocab.*.vercel.app/,
  ],
  credentials: true,
  exposedHeaders: ['set-cookie'],
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// need cookieParser middleware before we can do anything with cookies
app.use(cookieParser())
// let static middleware do its job
// app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/api', vocabRouter)
app.use('/', authRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

app.use(function (err: Parameters<ErrorRequestHandler>[0], req: Request, res: Response, next: NextFunction) {
  // set locals, only providing errors in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

export default app
