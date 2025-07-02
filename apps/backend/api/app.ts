import type { VercelRequest, VercelResponse } from '@vercel/node'

import { fastify } from '@backend/app.ts'

// https://github.com/vercel/examples/blob/main/solutions/node-hello-world/api/hello.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await fastify.ready()
  fastify.server.emit('request', req, res)
}
