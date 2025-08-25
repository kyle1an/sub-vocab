import type { Atom, Setter, WritableAtom } from 'jotai'

import { pipe } from 'effect'
import { noop } from 'es-toolkit'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import type { AppendParameters } from '@/lib/utilities'

import { myStore } from '@/store/useVocab'
import { tap } from '@sub-vocab/utils/lib'

export function myAtomFamily<Param, AtomType extends Atom<unknown>>(label: string, initializeAtom: (param: Param) => AtomType, areEqual?: (a: Param, b: Param) => boolean) {
  const paramsAtom = atom([] as Param[])
  paramsAtom.debugLabel = `${label}.paramsAtom`
  return pipe(
    atomFamily((param: NonNullable<Param>) => pipe(
      initializeAtom(param),
      tap((x) => {
        const key = Array.isArray(param) ? param[0] : typeof param === 'object' && 'key' in param ? param.key : param
        x.debugLabel = `${label}-${key}`
      }),
    ), areEqual),
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
    (x) => Object.assign(x, { paramsAtom }),
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
    (x) => withAbortableMount(x, (setAtom, signal) => {
      const listener = () => {
        setAtom(mql.matches)
      }
      mql.addEventListener('change', listener, { signal })
      listener()
    }),
    withReadonly,
  )
}

export const withDelayedSetter = <Value, Args extends unknown[], Result>(setAtom: WritableAtom<Value, Args, Result>) => {
  let timeoutId: undefined | number
  const cancel = () => clearTimeout(timeoutId)
  const retimeAtom = atom(null, (get, set, timeout: number, ...args: Args) => {
    cancel()
    timeoutId = setTimeout(() => {
      set(setAtom, ...args)
    }, timeout)
  })
  return Object.assign(setAtom, {
    retimeAtom: Object.assign(retimeAtom, {
      cancel,
    }),
  })
}

export const retimerAtomFamily = (label: string) => {
  const family = atomFamily((id: string) => {
    let timeoutId: undefined | number
    let isMounted = false

    const retime = (handler?: () => void, timeout?: number) => {
      clearTimeout(timeoutId)
      timeoutId = undefined

      if (handler) {
        timeoutId = setTimeout(() => {
          timeoutId = undefined
          handler()
        }, timeout)
      }
    }

    const tryRemove = () => {
      if (!isMounted && !timeoutId) {
        family.remove(id)
      }
    }

    return pipe(
      atom(() => Object.assign(retime, { tryRemove }), noop),
      (x) => withMount(x, () => {
        isMounted = true
        return () => {
          isMounted = false
        }
      }),
      withReadonly,
      tap((x) => {
        x.debugLabel = `${label}-${id}`
      }),
    )
  })

  return family
}

export const setAtom = <Value, Args extends unknown[], Result>(set: Setter, a: WritableAtom<Value, Args, Result>) => (...args: Args) => set(a, ...args)
