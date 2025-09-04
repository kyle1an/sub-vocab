import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'

import type { tmdb } from '@sub-vocab/utils/types'

import { env } from '@/env'

const baseUrl = env.NEXT_PUBLIC_SUB_API_URL

const fetchClient = createFetchClient<tmdb.paths>({
  baseUrl: `${baseUrl}/tmdb-proxy`,
})
export const $api = createClient(fetchClient)
