import type { PartialDeep } from 'type-fest'

import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { Duration, identity } from 'effect'
import { atom, useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { ofetch } from 'ofetch'
import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'
import PQueue from 'p-queue'

import type { paths } from '@/types/schema/opensubtitles'

import { env } from '@/env'
import { bindApply } from '@/lib/bindApply'
import { downloadFile } from '@/lib/downloadFile'
import { omitUndefined } from '@/lib/utilities'

const baseUrl = env.VITE_SUB_API_URL

const fetchClient = createFetchClient<paths>({
  baseUrl: `${baseUrl}/opensubtitles-proxy/def`,
})
export const $osApi = createClient(fetchClient)

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

/*
  * https://opensubtitles.stoplight.io/docs/opensubtitles-api/a172317bd5ccc-search-for-subtitles
  */
export type Subtitles = {
  Query: NonNullable<paths['/subtitles']['get']['parameters']['query']>
  Response: paths['/discover/most_downloaded']['get']['responses'][200]['content']['application/json']
}

export const useOpenSubtitlesQueryOptions = () => {
  const { baseUrl, headers } = useAtomValue(opensubtitlesReqAtom)
  return (query: Subtitles['Query']) => {
    // https://opensubtitles.stoplight.io/docs/opensubtitles-api/6ef2e232095c7-best-practices
    const sortedQuery = Object.fromEntries(Object.entries(query).sort())
    return queryOptions({
      // eslint-disable-next-line @tanstack/query/exhaustive-deps
      queryKey: ['opensubtitles-subtitles', sortedQuery],
      queryFn: () => ofetch<Subtitles['Response']>(`${baseUrl}/subtitles`, {
        method: 'GET',
        query: sortedQuery,
        headers,
      }),
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
export type Login = {
  Body: NonNullable<paths['/login']['post']['requestBody']>['content']['application/json']
  Response: paths['/login']['post']['responses'][200]['content']['application/json']
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
  interval: Duration.toMillis('1 seconds'),
  intervalCap: 20,
  carryoverConcurrencyCount: true,
})

const withHighPriorityOsQueue = <A extends any[], R>(f: (...a: A) => R) => (...a: A) => {
  return osQueue.add(() => f(...a), {
    throwOnTimeout: true,
  })
}

const withNormalPriorityOsQueue = <A extends any[], R>(f: (...a: A) => R) => (...a: A) => {
  return osQueue.add(() => f(...a), {
    throwOnTimeout: true,
    priority: 2,
  })
}

function useRequestSubtitleURL() {
  const { baseUrl } = useAtomValue(opensubtitlesReqAtom)
  const Authorization = useAtomValue(opensubtitlesAuthorizationAtom)
  return useMutation({
    mutationKey: ['requestSubtitleDownloadURL'],
    mutationFn: (body: Download['Body']) => ofetch<Download['Response']>(`${baseUrl}/download`, {
      method: 'POST',
      body,
      headers: omitUndefined({
        Authorization,
      }),
    }),
    retry: 4,
  })
}

function useGetFileByLink() {
  return useMutation({
    mutationKey: ['getFileByLink'] as const,
    mutationFn: identity(bindApply(ofetch<string, 'text'>)),
    retry: 4,
  })
}

function useDownloadFileByLink() {
  return useMutation({
    mutationKey: ['useDownloadFileByLink'] as const,
    mutationFn: identity(bindApply(downloadFile)),
    retry: 4,
  })
}

export function useOpenSubtitlesText() {
  const { mutateAsync: requestSubtitleURL } = useRequestSubtitleURL()
  const { mutateAsync: getFileByLink } = useGetFileByLink()
  return useMutation({
    mutationKey: ['useOpenSubtitlesText'] as const,
    mutationFn: async (body: Download['Body']) => {
      const file = await withHighPriorityOsQueue(requestSubtitleURL)(body)
      const text = await withNormalPriorityOsQueue(getFileByLink)([file.link, { responseType: 'text' }])
      return {
        file,
        text,
      }
    },
    retry: 4,
  })
}

export function useOpenSubtitlesDownload() {
  const { mutateAsync: requestSubtitleURL } = useRequestSubtitleURL()
  const { mutateAsync: downloadFileByLink } = useDownloadFileByLink()
  return useMutation({
    mutationKey: ['useOpenSubtitlesDownload'] as const,
    mutationFn: async (body: Download['Body']) => {
      const file = await withHighPriorityOsQueue(requestSubtitleURL)(body)
      await withNormalPriorityOsQueue(downloadFileByLink)([file.link, file.file_name])
    },
    retry: 4,
  })
}
