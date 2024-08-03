import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:http'
import process from 'node:process'
import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import { Server } from 'socket.io'
import Debug from 'debug'
import { parse } from 'cookie'
import routes from './src/routes/index.js'
import { isTokenValid } from './src/utils/util.js'
import type { CookiesObj } from './src/routes/auth.js'
import type { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from './src/types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors({
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
