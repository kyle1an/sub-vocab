import { useAbortableEffect } from 'foxact/use-abortable-effect'
import { useState } from 'react'

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(() => document.visibilityState === 'visible')

  useAbortableEffect((signal) => {
    // eslint-disable-next-line react-web-api/no-leaked-event-listener
    document.addEventListener('visibilitychange', () => {
      setIsVisible(document.visibilityState === 'visible')
    }, { signal })
  }, [])

  return isVisible
}
