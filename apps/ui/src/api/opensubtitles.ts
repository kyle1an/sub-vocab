import type { ExtractAtomValue } from 'jotai'
import type { PartialDeep } from 'type-fest'

import { queryOptions } from '@tanstack/react-query'
import { Duration, identity } from 'effect'
import { atom } from 'jotai'
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query'
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

export const openSubtitlesQueryOptionsAtom = atom((get) => {
  const { baseUrl, headers } = get(opensubtitlesReqAtom)
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
})

export const openSubtitlesSubtitlesAtom = (query: Subtitles['Query']) => atomWithQuery((get) => get(openSubtitlesQueryOptionsAtom)(query))

export type SubtitleResponseData = NonNullable<ExtractAtomValue<ReturnType<typeof openSubtitlesSubtitlesAtom>>['data']>[number]

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

const requestSubtitleURLAtom = atomWithMutation((get) => {
  return {
    mutationKey: ['requestSubtitleDownloadURL'],
    mutationFn: (body: Download['Body']) => ofetch<Download['Response']>(`${get(opensubtitlesReqAtom).baseUrl}/download`, {
      method: 'POST',
      body,
      headers: omitUndefined({
        Authorization: get(opensubtitlesAuthorizationAtom),
      }),
    }),
    retry: 4,
  }
})

const fileAtom = atomWithMutation(() => {
  return {
    mutationKey: ['getFileByLink'] as const,
    mutationFn: identity(bindApply(ofetch<string, 'text'>)),
    retry: 4,
  }
})

const downloadFileByLinkAtom = atomWithMutation(() => {
  return {
    mutationKey: ['useDownloadFileByLink'] as const,
    mutationFn: identity(bindApply(downloadFile)),
    retry: 4,
  }
})

export const openSubtitlesTextAtom = atomWithMutation((get) => {
  return ({
    mutationKey: ['useOpenSubtitlesText'] as const,
    mutationFn: async (body: Download['Body']) => {
      const file = await withHighPriorityOsQueue(get(requestSubtitleURLAtom).mutateAsync)(body)
      const text = await withNormalPriorityOsQueue(get(fileAtom).mutateAsync)([file.link, { responseType: 'text' }])
      return {
        file,
        text,
      }
    },
    retry: 4,
  })
})

export const openSubtitlesDownloadAtom = atomWithMutation((get) => {
  return ({
    mutationKey: ['useOpenSubtitlesDownload'] as const,
    mutationFn: async (body: Download['Body']) => {
      const file = await withHighPriorityOsQueue(get(requestSubtitleURLAtom).mutateAsync)(body)
      await withNormalPriorityOsQueue(get(downloadFileByLinkAtom).mutateAsync)([file.link, file.file_name])
    },
    retry: 4,
  })
})
