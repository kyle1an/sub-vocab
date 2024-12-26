import type { MergeDeep, PartialDeep } from 'type-fest'

import { useMutation, useQuery } from '@tanstack/react-query'
import { ofetch } from 'ofetch'

import type { paths } from '@/types/schema-opensubtitles'

import { env } from '@/env'
import { omitUndefined } from '@/lib/utilities'

type subtitles_parameters_query = {
  // https://forum.opensubtitles.org/viewtopic.php?t=17146&start=105#p48222
  per_page?: number
}

type attributes_feature_details = {
  data: {
    attributes: {
      feature_details: {
        season_number?: number
        episode_number?: number
      }
    }
  }[]
}

export const osSessionAtom = atomWithStorage<PartialDeep<Login['Response']> | undefined>('osSessionAtom', undefined)

export const opensubtitlesAuthorizationAtom = atom((get) => {
  const osSession = get(osSessionAtom)
  if (osSession?.token) {
    return `Bearer ${osSession.token}`
  }
})

export const opensubtitlesReqAtom = atom((get) => {
  const osSession = get(osSessionAtom)

  if (osSession?.user?.vip) {
    const Authorization = get(opensubtitlesAuthorizationAtom)
    return {
      baseUrl: `${env.VITE_SUB_API_URL}/opensubtitles-proxy/vip`,
      headers: omitUndefined({
        Authorization,
      }),
    }
  }

  return {
    baseUrl: `${env.VITE_SUB_API_URL}/opensubtitles-proxy/def`,
    headers: {
    },
  }
})

type Subtitles = {
  Query: MergeDeep<NonNullable<paths['/subtitles']['get']['parameters']['query']>, subtitles_parameters_query>
  Response: MergeDeep<attributes_feature_details, paths['/discover/most_downloaded']['get']['responses'][200]['content']['application/json'], { recurseIntoArrays: true }>
}

export function useOpenSubtitlesSubtitles(query: Subtitles['Query']) {
  const { baseUrl, headers } = useAtomValue(opensubtitlesReqAtom)
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['opensubtitles-subtitles', query],
    queryFn() {
      return ofetch<Subtitles['Response']>(`${baseUrl}/subtitles`, {
        method: 'GET',
        query,
        headers,
      })
    },
  })
}

type Login = {
  Body: NonNullable<paths['/login']['post']['requestBody']>['content']['application/json']
  Response: paths['/login']['post']['responses'][200]['content']['application/json']
}

export function useOpenSubtitlesLogin() {
  const baseUrl = `${env.VITE_SUB_API_URL}/opensubtitles-proxy/def`
  return useMutation({
    mutationKey: ['subtitles-login'],
    mutationFn: (body: Login['Body']) => {
      return ofetch<Login['Response']>(`${baseUrl}/login`, {
        method: 'POST',
        body,
      })
    },
  })
}

type Download = {
  Body: NonNullable<paths['/download']['post']['requestBody']>['content']['application/json']
  Response: paths['/download']['post']['responses'][200]['content']['application/json']
}

export function useOpenSubtitlesDownload() {
  const { baseUrl } = useAtomValue(opensubtitlesReqAtom)
  const Authorization = useAtomValue(opensubtitlesAuthorizationAtom)
  return useMutation({
    mutationKey: ['subtitles-download'],
    mutationFn: (body: Download['Body']) => {
      return ofetch<Download['Response']>(`${baseUrl}/download`, {
        method: 'POST',
        body,
        headers: omitUndefined({
          Authorization,
        }),
      })
    },
  })
}
