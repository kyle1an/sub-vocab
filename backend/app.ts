import path from 'path'
import { createServer } from 'http'
import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import * as Sentry from '@sentry/node'
import { Server } from 'socket.io'
import Debug from 'debug'
import { parse } from 'cookie'
import routes from './src/routes'
import { isTokenValid } from './src/utils/util'
import type { CookiesObj } from './src/routes/auth'
import type { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from './src/types'

const app = express()
Sentry.init({
  dsn: 'https://9e87673145e44b74bd56ea896a7f1ce8@o4505257329098752.ingest.sentry.io/4505257478914048',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    // Automatically instrument Node.js libraries and frameworks
    ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0,
})
// RequestHandler creates a separate execution context, so that all
// transactions/spans/breadcrumbs are isolated across requests
app.use(Sentry.Handlers.requestHandler() as express.RequestHandler)
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

const corsOrigin = [
  /.*localhost.*$/,
  /.*127.0.0.1.*$/,
  /.*subvocab.netlify.app/,
  /.*subvocab.*.vercel.app/,
]
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  exposedHeaders: ['set-cookie'],
}))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// need cookieParser middleware before we can do anything with cookies
app.use(cookieParser())
// let static middleware do its job
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', routes)

app.use(Sentry.Handlers.errorHandler())

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

const PORT = Number(process.env.PORT || '5001')
app.set('port', PORT)

const server = createServer(app)

export const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
})

io.on('connection', (socket) => {
  const { _user: username = '', acct = '' } = parse(socket.handshake.headers.cookie ?? '') as CookiesObj
  isTokenValid(username, acct).then(async (isValid) => {
    if (isValid) {
      await socket.join(username)
    }
  }).catch(console.error)
})

server.listen(PORT, () => {
  console.log(`Socket server running at ${PORT}`)
})

server.on('error', function onError(error: NodeJS.ErrnoException) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = 'Port ' + PORT

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
})

const debug = Debug('subvocab-server:server')

server.on('listening', function onListening() {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr?.port
  debug('Listening on ' + bind)
  console.log(`Listening on port ${PORT}`)
})

export default app
