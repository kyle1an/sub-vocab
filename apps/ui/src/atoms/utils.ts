import type { Atom, WritableAtom } from 'jotai'
import type { AtomFamily } from 'jotai/vanilla/utils/atomFamily'

import { pipe } from 'effect'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { useSyncExternalStore } from 'react'

import type { AppendParameters } from '@/lib/utilities'

import { myStore } from '@/store/useVocab'
import { tap } from '@sub-vocab/utils/lib'

type WithParamsAtomFamily<Param, AtomType> = AtomFamily<Param, AtomType> & { paramsAtom: ReturnType<typeof atom<Param[]>> }

export function myAtomFamily<Param, AtomType extends Atom<unknown>>(label: string, initializeAtom: (param: Param) => AtomType, areEqual?: (a: Param, b: Param) => boolean) {
  const paramsAtom = atom<Param[]>([])
  paramsAtom.debugLabel = `${label}.paramsAtom`
  return pipe(
    atomFamily((param: Param) => {
      const newAtom = initializeAtom(param)
      newAtom.debugLabel = `${label}-${param}`
      return newAtom
    }, areEqual),
    tap((v) => {
      v.unstable_listen((event) => {
        if (event.type === 'CREATE') {
          queueMicrotask(() => {
            myStore.set(paramsAtom, (prev) => [...prev, event.param])
          })
        } else {
          myStore.set(paramsAtom, (prev) => prev.filter((param) => param !== event.param))
        }
      })
    }),
    (v) => Object.assign(v, { paramsAtom }),
  )
}

export const useFamily = <Param, AtomType>(atomFamily: AtomFamily<Param, AtomType>, param: Param) => {
  return useSyncExternalStore(
    atomFamily.unstable_listen,
    () => atomFamily(param),
  )
}

export function withMount<Value, Args extends unknown[], Result>(anAtom: WritableAtom<Value, Args, Result>, onMount: NonNullable<typeof anAtom['onMount']>) {
  anAtom.onMount = onMount
  return anAtom
}

export function withAbortableMount<Value, Args extends unknown[], Result>(anAtom: WritableAtom<Value, Args, Result>, onMount: AppendParameters<NonNullable<typeof anAtom['onMount']>, [signal: AbortSignal]>) {
  return withMount(anAtom, (setAtom) => {
    const controller = new AbortController()
    const onUnmount = onMount(setAtom, controller.signal)
    return () => {
      controller.abort()
      onUnmount?.()
    }
  })
}

export function withReadonly<Value, Args extends unknown[], Result>(anAtom: WritableAtom<Value, Args, Result>) {
  return atom((get) => get(anAtom))
}

export const atomWithMediaQuery = (query: string) => {
  const mql = window.matchMedia(query)
  return pipe(
    atom(mql.matches),
    (v) => withAbortableMount(v, (setAtom, signal) => {
      const listener = () => {
        setAtom(mql.matches)
      }
      mql.addEventListener('change', listener, { signal })
      listener()
    }),
    withReadonly,
  )
}
