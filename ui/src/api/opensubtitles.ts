import type { MergeDeep, PartialDeep } from 'type-fest'

import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ofetch } from 'ofetch'
import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'
import PQueue from 'p-queue'

import type { paths } from '@/types/schema/opensubtitles'

import { env } from '@/env'
import { omitUndefined } from '@/lib/utilities'
import { subtitleDownloadProgressAtom } from '@/store/useVocab'

const baseUrl = env.VITE_SUB_API_URL

const fetchClient = createFetchClient<paths>({
  baseUrl: `${baseUrl}/opensubtitles-proxy/def`,
})
export const $osApi = createClient(fetchClient)

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
  if (osSession?.token)
    return `Bearer ${osSession.token}`
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

/*
  * https://opensubtitles.stoplight.io/docs/opensubtitles-api/a172317bd5ccc-search-for-subtitles
  */
export type Subtitles = {
  Query: MergeDeep<NonNullable<paths['/subtitles']['get']['parameters']['query']>, subtitles_parameters_query>
  Response: MergeDeep<attributes_feature_details, paths['/discover/most_downloaded']['get']['responses'][200]['content']['application/json'], { recurseIntoArrays: true }>
}

export const useOpenSubtitlesQueryOptions = () => {
  const { baseUrl, headers } = useAtomValue(opensubtitlesReqAtom)
  return (query: Subtitles['Query']) => {
    // https://opensubtitles.stoplight.io/docs/opensubtitles-api/6ef2e232095c7-best-practices
    const sortedQuery = Object.fromEntries(Object.entries(query).sort())
    return queryOptions({
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: ['opensubtitles-subtitles', sortedQuery],
      queryFn() {
        return ofetch<Subtitles['Response']>(`${baseUrl}/subtitles`, {
          method: 'GET',
          query: sortedQuery,
          headers,
        })
      },
      select: (data) => data.data,
    })
  }
}

export function useOpenSubtitlesSubtitles(query: Subtitles['Query']) {
  const openSubtitlesQueryOptions = useOpenSubtitlesQueryOptions()
  return useQuery(openSubtitlesQueryOptions(query))
}

export type SubtitleResponseData = NonNullable<ReturnType<typeof useOpenSubtitlesSubtitles>['data']>[number]

/*
  * https://opensubtitles.stoplight.io/docs/opensubtitles-api/73acf79accc0a-login
  */
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

/*
  * https://opensubtitles.stoplight.io/docs/opensubtitles-api/6be7f6ae2d918-download
  */
export type Download = {
  Body: NonNullable<paths['/download']['post']['requestBody']>['content']['application/json']
  Response: paths['/download']['post']['responses'][200]['content']['application/json']
}

const osQueue = new PQueue({
  concurrency: 20,
  interval: 1000,
  intervalCap: 20,
  carryoverConcurrencyCount: true,
})

function useRequestSubtitleURL() {
  const { baseUrl } = useAtomValue(opensubtitlesReqAtom)
  const Authorization = useAtomValue(opensubtitlesAuthorizationAtom)
  return useMutation({
    mutationKey: ['requestSubtitleDownloadURL'],
    mutationFn: (body: Download['Body']) => {
      return osQueue.add(() => ofetch<Download['Response']>(`${baseUrl}/download`, {
        method: 'POST',
        body,
        headers: omitUndefined({
          Authorization,
        }),
      }), {
        throwOnTimeout: true,
      })
    },
    retry: 4,
    retryDelay: (failureCount) => 1000 * (failureCount - 1),
  })
}

function useGetFileByLink() {
  return useMutation({
    mutationKey: ['getFileByLink'] as const,
    mutationFn: async (link: string) => {
      return osQueue.add(() => ofetch<string>(link), {
        throwOnTimeout: true,
        priority: 1,
      })
    },
    retry: 4,
    retryDelay: (failureCount) => 1000 * (failureCount - 1),
  })
}

export function useOpenSubtitlesDownload() {
  const setSubtitleDownloadProgress = useSetAtom(subtitleDownloadProgressAtom)
  const { mutateAsync: requestSubtitleURL } = useRequestSubtitleURL()
  const { mutateAsync: getFileByLink } = useGetFileByLink()
  return useMutation({
    mutationKey: ['getSubtitleByFileId'] as const,
    mutationFn: async (body: Download['Body']) => {
      const file = await requestSubtitleURL(body)
      return {
        file,
        text: await getFileByLink(file.link),
      }
    },
    onSuccess: (data, body) => {
      setSubtitleDownloadProgress((prev) => {
        prev.push(body)
      })
    },
    retry: 4,
    retryDelay: (failureCount) => 1000 * (failureCount - 1),
  })
}
