import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express'

import * as trpcExpress from '@trpc/server/adapters/express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import Debug from 'debug'
import express from 'express'
import createError from 'http-errors'
import { createProxyMiddleware } from 'http-proxy-middleware'
import logger from 'morgan'
import { createServer } from 'node:http'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'pathe'

import { env } from './env.js'
import { aiRouter } from './src/routes/ai.js'
import { userRouter } from './src/routes/auth.js'
import routes from './src/routes/index.js'
import { router } from './src/routes/trpc.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function createContext({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) {
  return {}
}

type Context = Awaited<ReturnType<typeof createContext>>

const app = express()

app.use(cors({
  origin: true,
  credentials: true,
  exposedHeaders: ['set-cookie'],
}))

const appRouter = router({
  user: userRouter,
  ai: aiRouter,
})

export type AppRouter = typeof appRouter

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
)

;[
  {
    path: '/def',
    target: 'https://api.opensubtitles.com/api/v1',
  },
  {
    path: '/vip',
    target: 'https://vip-api.opensubtitles.com/api/v1',
  },
].forEach(({ path, target }) => app.use(
  `/opensubtitles-proxy${path}`,
  (req, res, next) => {
    req.headers['user-agent'] = env.APP_NAME__V_APP_VERSION
    req.headers['api-key'] = env.OPENSUBTITLES_API_KEY
    const url = new URL(target)
    req.headers['x-forwarded-host'] = url.host
    next()
  },
  createProxyMiddleware<Request, Response>({
    target,
    changeOrigin: true,
    followRedirects: true,
  }),
))

const tmdbTarget = 'https://api.themoviedb.org'

app.use(
  '/tmdb-proxy',
  (req, res, next) => {
    req.headers.authorization = `Bearer ${env.TMDB_TOKEN}`
    const url = new URL(tmdbTarget)
    // https://www.themoviedb.org/talk/673d9f8687917078d0108992
    req.headers['x-forwarded-host'] = url.host
    next()
  },
  createProxyMiddleware<Request, Response>({
    target: tmdbTarget,
    changeOrigin: true,
  }),
)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
// let static middleware do its job
app.use(express.static(join(__dirname, 'public')))

app.use('/', routes)
app.get(/favicon.*/, (req, res) => {
  res.status(204).end()
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

app.use(function (err: Parameters<ErrorRequestHandler>[0], req: Request, res: Response, next: NextFunction) {
  // set locals, only providing errors in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  res.status(err.status || 500)
  res.send('error')
})

const PORT = Number(process.env.PORT || '5001')

const server = createServer(app)

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = 'Port ' + PORT

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      throw error
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      throw error
    default:
      throw error
  }
})

const debug = Debug('subvocab-server:server')

server.on('listening', () => {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr?.port
  debug('Listening on ' + bind)
})

export default app
