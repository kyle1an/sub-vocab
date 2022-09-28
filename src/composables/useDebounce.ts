export function useDebounceTimeout(fn: () => void, ms = 0) {
  let timeoutID: ReturnType<typeof setTimeout>
  return function timeoutDebounce() {
    timeoutID && clearTimeout(timeoutID)
    timeoutID = setTimeout(fn, ms)
  }
}

export function useDebounceRAF(fn: () => void) {
  let rAF: ReturnType<typeof requestAnimationFrame>
  return function rAFDebounce() {
    rAF && cancelAnimationFrame(rAF)
    rAF = requestAnimationFrame(fn)
  }
}
