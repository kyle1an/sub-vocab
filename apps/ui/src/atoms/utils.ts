import type { Atom, WritableAtom } from 'jotai'
import type { AtomFamily } from 'jotai/vanilla/utils/atomFamily'

import { pipe } from 'effect'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import type { AppendParameters } from '@/lib/utilities'

import { myStore } from '@/store/useVocab'
import { tap } from '@sub-vocab/utils/lib'

type WithParamsAtomFamily<Param, AtomType> = AtomFamily<Param, AtomType> & { paramsAtom: ReturnType<typeof atom<Param[]>> }

export function myAtomFamily<Param, AtomType extends Atom<unknown>>(label: string, initializeAtom: (param: Param) => AtomType, areEqual?: (a: Param, b: Param) => boolean) {
  const paramsAtom = atom<Param[]>([])
  paramsAtom.debugLabel = `${label}.paramsAtom`
  return pipe(
    atomFamily((param: NonNullable<Param>) => {
      const newAtom = initializeAtom(param)
      newAtom.debugLabel = `${label}-${typeof param === 'object' && 'key' in param ? param.key : param}`
      return newAtom
    }, areEqual),
    tap((v) => {
      let latestEvent: Parameters<Parameters<typeof v['unstable_listen']>[0]>[0]
      v.unstable_listen((event) => {
        latestEvent = event
        queueMicrotask(() => {
          if (event === latestEvent) {
            myStore.set(paramsAtom, [...v.getParams()])
          }
        })
      })
    }),
    (v) => Object.assign(v, { paramsAtom }),
  )
}

// eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
export const useFamily = <Param, AtomType>(family: AtomFamily<Param, AtomType>, param: Param) => {
  return family(param)
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

export const retimerAtomFamily = (label: string) => {
  const family = atomFamily((id: string) => {
    let timeoutId: undefined | number
    let isMounted = false

    return pipe(
      atom(() => (handler?: () => void, timeout?: number | null) => {
        if (typeof timeoutId === 'number') {
          clearTimeout(timeoutId)
          timeoutId = undefined
        }

        if (handler) {
          if (typeof timeout === 'number' || typeof timeout === 'undefined') {
            timeoutId = setTimeout(() => {
              timeoutId = undefined
              handler()
              if (isMounted) return
              family.remove(id)
            }, timeout)
          } else {
            handler()
          }
        }
      }, () => {}),
      (v) => withMount(v, () => {
        isMounted = true
        return () => {
          isMounted = false
          if (timeoutId) return
          queueMicrotask(() => {
            if (timeoutId) return
            if (isMounted) return
            family.remove(id)
          })
        }
      }),
      withReadonly,
      tap((v) => {
        v.debugLabel = `${label}-${id}`
      }),
    )
  })

  return family
}
