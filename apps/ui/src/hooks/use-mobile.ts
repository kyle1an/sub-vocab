import { pipe } from 'effect'
import { atom, useAtomValue } from 'jotai'

import { withAbortableMount, withReadonly } from '@sub-vocab/utils/atoms'
import { isServer } from '@sub-vocab/utils/lib'

const MOBILE_BREAKPOINT = 768

const isMobileAtom = (() => {
  if (isServer) return atom(() => false)
  const getSnapshot = () => window.innerWidth < MOBILE_BREAKPOINT
  const mediaQueryList = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  return pipe(
    atom(getSnapshot()),
    (x) => withAbortableMount(x, (setAtom, signal) => {
      const listener = () => {
        setAtom(getSnapshot())
      }
      mediaQueryList.addEventListener('change', listener, { signal })
      listener()
    }),
    withReadonly,
  )
})()

export function useIsMobile() {
  return useAtomValue(isMobileAtom)
}
