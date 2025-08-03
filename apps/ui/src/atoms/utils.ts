import type { Atom } from 'jotai'
import type { AtomFamily } from 'jotai/vanilla/utils/atomFamily'

import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { useSyncExternalStore } from 'react'

import { myStore } from '@/store/useVocab'

type WithParamsAtomFamily<Param, AtomType> = AtomFamily<Param, AtomType> & { paramsAtom: ReturnType<typeof atom<Param[]>> }

export function myAtomFamily<Param, AtomType extends Atom<unknown>>(label: string, initializeAtom: (param: Param) => AtomType, areEqual?: (a: Param, b: Param) => boolean) {
  const paramsAtom = atom<Param[]>([])
  paramsAtom.debugLabel = `${label}.paramsAtom`
  const family = atomFamily((param: Param) => {
    const newAtom = initializeAtom(param)
    newAtom.debugLabel = `${label}-${param}`
    return newAtom
  }, areEqual)
  family.unstable_listen((event) => {
    if (event.type === 'CREATE') {
      queueMicrotask(() => {
        myStore.set(paramsAtom, (prev) => [...prev, event.param])
      })
    } else {
      myStore.set(paramsAtom, (prev) => prev.filter((param) => param !== event.param))
    }
  })
  return Object.assign(family, { paramsAtom })
}

export const useFamily = <Param, AtomType>(atomFamily: AtomFamily<Param, AtomType>, param: Param) => {
  return useSyncExternalStore(
    atomFamily.unstable_listen,
    () => atomFamily(param),
  )
}

export const createTimerFamily = (label: string) => {
  return atomFamily((id: string) => {
    const timerAtom = atom<undefined | number>(undefined)
    timerAtom.debugLabel = `${label}-timerAtom`
    const resettableTimerAtom = atom((get) => get(timerAtom), (get, set, timeoutOrHandler?: number | null | (() => void), handler?: () => void) => {
      const timer = get(timerAtom)
      if (typeof timer === 'number') {
        clearTimeout(timer)
      }

      if (typeof timeoutOrHandler === 'function') {
        timeoutOrHandler()
        set(timerAtom, undefined)
      } else if (typeof timeoutOrHandler === 'number') {
        set(timerAtom, setTimeout(() => {
          handler?.()
          set(timerAtom, undefined)
        }, timeoutOrHandler))
      } else {
        handler?.()
        set(timerAtom, undefined)
      }
    })
    resettableTimerAtom.debugLabel = `${label}-retimerAtom`
    return resettableTimerAtom
  })
}

export function sweepStaleTimers<Param, AtomType extends Atom<unknown>>(atomFamily: AtomFamily<Param, AtomType>) {
  ;[...atomFamily.getParams()].forEach((p) => {
    if (!myStore.get(atomFamily(p))) {
      atomFamily.remove(p)
    }
  })
}
