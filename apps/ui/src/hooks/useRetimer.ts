import { useMemo, useRef } from 'react'

export function useRetimer() {
  const timerIdRef = useRef<number>(undefined)

  return useMemo(() => {
    function retimer(timeout: number, handler: () => void): void
    function retimer(handler: () => void): void
    function retimer(): void
    function retimer(timeoutOrHandler?: number | (() => void), handler?: () => void) {
      const timer = timerIdRef.current
      if (typeof timer === 'number') {
        clearTimeout(timer)
      }

      if (typeof timeoutOrHandler === 'number') {
        timerIdRef.current = setTimeout(() => {
          handler?.()
          timerIdRef.current = undefined
        }, timeoutOrHandler)
      } else {
        timeoutOrHandler?.()
        timerIdRef.current = undefined
      }
    }
    return retimer
  }, [])
}
