import { pipe } from 'effect'
import { atomFamily } from 'jotai/utils'

import { tap } from '../lib/utils'
import { atomWithMediaQuery, withReadOnlyMount } from './utils'

export const mediaQueryFamily = pipe(atomFamily((query: string) => {
  let isMounted = false
  return pipe(
    atomWithMediaQuery(query),
    (x) => withReadOnlyMount(x, () => {
      isMounted = true
      return () => {
        isMounted = false
        queueMicrotask(() => {
          if (!isMounted) {
            mediaQueryFamily.remove(query)
          }
        })
      }
    }),
    tap((x) => {
      x.debugLabel = `mediaQueryAtomFamily-${query}`
    }),
  )
}), (x) => Object.assign(x, {
  useA: x,
}))
