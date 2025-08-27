import type { InitialTableState, RowSelectionState } from '@tanstack/react-table'
import type { LiteralUnion } from 'type-fest'

import { atom } from 'jotai'

import { myAtomFamily } from '@/atoms'
import { createFactory, equalBy } from '@sub-vocab/utils/lib'

export type MediaSubtitleState = {
  episodeFilter?: LiteralUnion<'all', string>
  initialTableState: InitialTableState
  tableState: {
    rowSelection: RowSelectionState
  }
}

export const buildMediaSubtitleState = createFactory<MediaSubtitleState>()(() => ({
  initialTableState: {
    pagination: {
      pageSize: 10,
      pageIndex: 0,
    },
  },
  tableState: {
    rowSelection: {},
  },
}))

export const mediaSubtitleAtomFamily = myAtomFamily(
  `mediaSubtitleAtomFamily`,
  ([
    ,
    initialValue = buildMediaSubtitleState(),
  ]: [
    key: number,
    initialValue?: MediaSubtitleState,
  ]) => atom(initialValue),
  equalBy(([key]) => key),
)

export const fileIdsAtom = atom((get) => {
  return get(mediaSubtitleAtomFamily.paramsAtom)
    .map((param) => get(mediaSubtitleAtomFamily(param)))
    .flatMap(({ tableState }) => Object.entries(tableState.rowSelection).filter(([, v]) => v).map(([k]) => Number(k)))
})
