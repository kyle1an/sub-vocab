import type { PaginationState, RowSelectionState } from '@tanstack/react-table'
import type { Draft } from 'immer'
import type { LiteralUnion } from 'type-fest'

import { flow, identity } from 'effect'
import { produce } from 'immer'
import { atom } from 'jotai'
import { withAtomEffect } from 'jotai-effect'
import { atomFamily } from 'jotai/utils'

import { createFactory } from '@sub-vocab/utils/lib'

type Recipe<Base, D = Draft<Base>> = (draft: D) => D | void | undefined

export type MediaSubtitleState = {
  rowSelection: RowSelectionState
  episodeFilter?: LiteralUnion<'all', string>
  pagination?: PaginationState
}

export const buildMediaSubtitleState = createFactory<MediaSubtitleState>()(() => ({
  rowSelection: {},
}))

const mediaSubtitleKeysAtom = atom(new Set<number>())

export const mediaSubtitleAtomFamily = atomFamily((mediaId: number) => {
  const mediaSubtitleAtom = atom(identity<MediaSubtitleState>(buildMediaSubtitleState()))
  return withAtomEffect(
    mediaSubtitleAtom,
    ({ peek }, set) => {
      if (!peek(mediaSubtitleKeysAtom).has(mediaId)) {
        set(mediaSubtitleKeysAtom, produce((currentKeySet) => {
          currentKeySet.add(mediaId)
        }))
      }
    },
  )
})

export const fileIdsAtom = atom((get) => {
  return [...get(mediaSubtitleKeysAtom)]
    .map(flow(mediaSubtitleAtomFamily, get))
    .flatMap(({ rowSelection }) => Object.entries(rowSelection).filter(([,v]) => v).map(([k]) => Number(k)))
})
