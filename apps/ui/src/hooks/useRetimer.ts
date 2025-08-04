import { useCallback, useRef } from 'react'

export function useRetimer() {
  const timeoutIdRef = useRef<number>(undefined)
  return useCallback((handler?: () => void, timeout?: number | null) => {
    if (typeof timeoutIdRef.current === 'number') {
      clearTimeout(timeoutIdRef.current)
    }

    if (handler) {
      if (typeof timeout === 'number' || typeof timeout === 'undefined') {
        timeoutIdRef.current = setTimeout(handler, timeout)
      } else {
        handler()
      }
    }
  }, [])
}
