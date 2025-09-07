import cors from '@fastify/cors'
import { fastifyHttpProxy } from '@fastify/http-proxy'
import Fastify from 'fastify'

import { env } from '@backend/env'

const app = Fastify()

await app.register(cors, {
  origin: true,
  credentials: true,
  exposedHeaders: ['set-cookie'],
})

;[
  {
    path: '/def',
    target: {
      href: 'https://api.opensubtitles.com/api/v1',
      host: 'api.opensubtitles.com',
    },
  },
  {
    path: '/vip',
    target: {
      href: 'https://vip-api.opensubtitles.com/api/v1',
      host: 'vip-api.opensubtitles.com',
    },
  },
].forEach(({ path, target }) => app.register(fastifyHttpProxy, {
  upstream: target.href,
  prefix: `/opensubtitles-proxy${path}`,
  replyOptions: {
    rewriteRequestHeaders: (request, headers) => ({
      ...headers,
      'user-agent': env.APP_NAME__V_APP_VERSION,
      'api-key': env.OPENSUBTITLES_API_KEY,
      'x-forwarded-host': target.host,
    }),
  },
}))

const tmdbUrl = {
  href: 'https://api.themoviedb.org',
  host: 'api.themoviedb.org',
}

app.register(fastifyHttpProxy, {
  upstream: tmdbUrl.href,
  prefix: '/tmdb-proxy',
  replyOptions: {
    rewriteRequestHeaders: (request, headers) => ({
      ...headers,
      authorization: `Bearer ${env.TMDB_TOKEN}`,
      // https://www.themoviedb.org/talk/673d9f8687917078d0108992
      'x-forwarded-host': tmdbUrl.host,
    }),
  },
})

app.get('/', (request, reply) => reply.send('API is running'))

app.get('/favicon.ico', (request, reply) => reply.code(204).send())

export { app as fastify }
