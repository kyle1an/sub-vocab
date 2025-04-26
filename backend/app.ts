import type { FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify'

import cors from '@fastify/cors'
import { fastifyHttpProxy } from '@fastify/http-proxy'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import Fastify from 'fastify'

import { createContext } from '@backend/context'
import { env } from '@backend/env'
import { aiRouter } from '@backend/src/routes/ai'
import { userRouter } from '@backend/src/routes/auth'
import { router } from '@backend/src/routes/trpc'

const app = Fastify()

await app.register(cors, {
  origin: true,
  credentials: true,
  exposedHeaders: ['set-cookie'],
})

const appRouter = router({
  user: userRouter,
  ai: aiRouter,
})

export type AppRouter = typeof appRouter

app.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error(`Error in tRPC handler on path '${path}':`, error)
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
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
