import { defineConfig } from 'drizzle-kit'

import { env } from './env'

export default defineConfig({
  schemaFilter: ['auth', 'public'],
  dialect: 'postgresql',
  out: './drizzle',
  schema: './drizzle/schema.ts',
  dbCredentials: {
    url: env.POSTGRES_URL,
  },
})
