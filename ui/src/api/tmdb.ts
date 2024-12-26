import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'

import type { paths } from '@/types/schema-themoviedb'

import { env } from '@/env'

const baseUrl = env.VITE_SUB_API_URL

const fetchClient = createFetchClient<paths>({
  baseUrl: `${baseUrl}/tmdb-proxy`,
})
export const $api = createClient(fetchClient)
