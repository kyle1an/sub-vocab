import { useAbortableEffect } from 'foxact/use-abortable-effect'
import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  useAbortableEffect((signal) => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    // eslint-disable-next-line react-web-api/no-leaked-event-listener
    mql.addEventListener('change', () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }, { signal })
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
  }, [])

  return !!isMobile
}
