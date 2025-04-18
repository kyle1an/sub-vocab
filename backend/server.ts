import { fastify } from '@backend/app'

fastify.listen({ port: 5001 }, (error, address) => {
  console.log(error, address)
})
