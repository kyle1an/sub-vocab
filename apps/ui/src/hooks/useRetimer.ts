import { useMemo, useRef } from 'react'

export function useRetimer() {
  const timeoutIdRef = useRef<number>(undefined)
  return useMemo(() => {
    function retimer(handler: () => void, timeout: number,): void
    function retimer(handler: () => void, timeout: null): void
    function retimer(): void
    function retimer(handler?: () => void, timeout?: number | null) {
      if (typeof timeoutIdRef.current === 'number') {
        clearTimeout(timeoutIdRef.current)
      }

      if (handler) {
        if (typeof timeout === 'number') {
          timeoutIdRef.current = setTimeout(() => {
            handler()
          }, timeout)
        } else {
          handler()
        }
      }
    }
    return retimer
  }, [])
}
