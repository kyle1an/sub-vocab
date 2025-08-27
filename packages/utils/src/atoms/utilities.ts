import { pipe } from 'effect'
import { atom } from 'jotai'

import { withAbortableMount, withReadonly } from '../atoms'
import { isServer } from '../lib'

export const documentVisibilityStateAtom = (() => {
  if (isServer) return atom(() => 'hidden')
  return pipe(
    atom(document.visibilityState),
    (x) => withAbortableMount(x, (setAtom, signal) => {
      const listener = () => {
        setAtom(document.visibilityState)
      }
      document.addEventListener('visibilitychange', listener, { signal })
      listener()
    }),
    withReadonly,
  )
})()
