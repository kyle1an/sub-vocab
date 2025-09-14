import type { Atom } from 'jotai'

import { pipe } from 'effect'
import { atom, createStore } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { withUseA } from '@sub-vocab/utils/atoms'
import { tap } from '@sub-vocab/utils/lib'

export const myStore = createStore()

export const withParamsAtomFamily = <Param, AtomType extends Atom<unknown>>(initializeAtom: (param: Param) => AtomType, areEqual?: (a: Param, b: Param) => boolean, label?: string) => {
  const paramsAtom = atom([] as Param[])
  paramsAtom.debugLabel = `${label}.paramsAtom`
  return pipe(
    atomFamily(
      (param: NonNullable<Param>) => pipe(
        initializeAtom(param),
        tap((x) => {
          const key = Array.isArray(param) ? param[0] : param
          x.debugLabel = `${label}-${key}`
        }),
      ),
      areEqual,
    ),
    tap(({ unstable_listen, getParams }) => {
      let latestEvent: Parameters<Parameters<typeof unstable_listen>[0]>[0]
      unstable_listen((event) => {
        latestEvent = event
        queueMicrotask(() => {
          if (event === latestEvent) {
            myStore.set(paramsAtom, [...getParams()])
          }
        })
      })
    }),
    (x) => Object.assign(x, {
      paramsAtom,
    }),
    withUseA,
  )
}
