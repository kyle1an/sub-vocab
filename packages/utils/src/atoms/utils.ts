import type { Atom, Setter, WritableAtom } from 'jotai'

import { pipe } from 'effect'
import { noop } from 'es-toolkit'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import type { AppendParameters } from '../lib/utilities'

import { isServer } from '../lib/utilities'
import { tap } from '../lib/utils'

export function withMount<Value, Args extends unknown[], Result>(anAtom: WritableAtom<Value, Args, Result>, onMount: NonNullable<typeof anAtom['onMount']>) {
  return pipe(
    anAtom,
    tap((x) => {
      x.onMount = onMount
    }),
  )
}

export function withReadOnlyMount<Value>(anAtom: Atom<Value>, onMount: NonNullable<WritableAtom<Value, [], void>['onMount']>) {
  return pipe(
    atom((get) => get(anAtom), noop),
    (x) => withMount(x, onMount),
    withReadonly,
  )
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
  if (isServer) return atom(() => false)
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
    timeoutId = window.setTimeout(() => {
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
        timeoutId = window.setTimeout(() => {
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
      atom(() => Object.assign(retime, { tryRemove })),
      (x) => withReadOnlyMount(x, () => {
        isMounted = true
        return () => {
          isMounted = false
        }
      }),
      tap((x) => {
        x.debugLabel = `${label}-${id}`
      }),
    )
  })

  return family
}

export const setAtom = <Value, Args extends unknown[], Result>(set: Setter, a: WritableAtom<Value, Args, Result>) => (...args: Args) => set(a, ...args)
