import { pipe } from 'effect'
import { atom, useAtomValue } from 'jotai'

import { withAbortableMount, withReadonly } from '@/atoms/utils'

const MOBILE_BREAKPOINT = 768

const isMobileAtom = (() => {
  const getSnapshot = () => window.innerWidth < MOBILE_BREAKPOINT
  const mediaQueryList = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  return pipe(
    atom(getSnapshot()),
    (v) => withAbortableMount(v, (setAtom, signal) => {
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
  const isMobile = useAtomValue(isMobileAtom)
  return isMobile
}
