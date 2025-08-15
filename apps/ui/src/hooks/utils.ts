import { pipe } from 'effect'
import { atom } from 'jotai'

import { withAbortableMount, withReadonly } from '@/atoms/utils'

export const documentVisibilityStateAtom = (() => {
  return pipe(
    atom(document.visibilityState),
    (v) => withAbortableMount(v, (setAtom, signal) => {
      const listener = () => {
        setAtom(document.visibilityState)
      }
      document.addEventListener('visibilitychange', listener, { signal })
      listener()
    }),
    withReadonly,
  )
})()
