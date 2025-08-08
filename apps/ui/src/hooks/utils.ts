import { pipe } from 'effect'
import { atom } from 'jotai'

import { withAbortableMount, withReadonly } from '@/atoms/utils'

export const pageVisibilityAtom = (() => {
  const isVisible = () => document.visibilityState === 'visible'
  return pipe(
    atom(isVisible()),
    (v) => withAbortableMount(v, (setAtom, signal) => {
      const listener = () => {
        setAtom(isVisible())
      }
      document.addEventListener('visibilitychange', listener, { signal })
      listener()
    }),
    withReadonly,
  )
})()
