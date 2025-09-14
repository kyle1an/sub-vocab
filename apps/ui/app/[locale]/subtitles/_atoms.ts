import type { InitialTableState, RowSelectionState } from '@tanstack/react-table'
import type { LiteralUnion } from 'type-fest'

import { pipe } from 'effect'
import { isEqual } from 'es-toolkit'
import { atom } from 'jotai'
import { atomFamily, atomWithStorage } from 'jotai/utils'

import { withParamsAtomFamily } from '@/atoms/store'
import { withUnmountCallbackAtom, withUseA } from '@sub-vocab/utils/atoms'
import { createFactory, equalBy } from '@sub-vocab/utils/lib'

export const osLanguageAtom = atomWithStorage('osLanguageAtom', 'en')
osLanguageAtom.debugLabel = 'osLanguageAtom'

export type MediaSubtitleState = {
  episodeFilter?: LiteralUnion<'all', string>
  tableState: {
    rowSelection: RowSelectionState
  }
}

const buildMediaSubtitleState = createFactory<MediaSubtitleState>()(() => ({
  tableState: {
    rowSelection: {},
  },
}))

export const mediaSubtitleFamily = withParamsAtomFamily(
  ([
    key,
    initialValue = buildMediaSubtitleState(),
  ]: [
    key: number,
    initialValue?: MediaSubtitleState,
  ]) => {
    return pipe(
      atom(initialValue),
      (x) => {
        return withUnmountCallbackAtom(x, (get) => {
          if (isEqual(get(x), initialValue)) {
            mediaSubtitleFamily.remove([key])
          }
        })
      },
    )
  },
  equalBy(([key]) => key),
  `mediaSubtitleFamily`,
)

export const buildInitialTableState = createFactory<InitialTableState>()(() => ({
  pagination: {
    pageSize: 10,
    pageIndex: 0,
  },
}))

export const initialTableStateFamily = withUseA(atomFamily(
  ([
    key,
    initialValue = buildInitialTableState(),
  ]: [
    key: number,
    initialValue?: InitialTableState,
  ]) => {
    return pipe(
      atom(initialValue),
      (x) => {
        return withUnmountCallbackAtom(x, (get) => {
          if (isEqual(get(x), initialValue)) {
            initialTableStateFamily.remove([key])
          }
        })
      },
    )
  },
  equalBy(([key]) => key),
))

export const fileIdsAtom = atom((get) => {
  return get(mediaSubtitleFamily.paramsAtom)
    .map((param) => get(mediaSubtitleFamily(param)))
    .flatMap(({ tableState }) => Object.entries(tableState.rowSelection).filter(([, v]) => v).map(([k]) => Number(k)))
})
fileIdsAtom.debugLabel = 'fileIdsAtom'
