import type { UseTransitionOptions } from '@vueuse/core'
import { useTransition } from '@vueuse/core'
import { Ref } from 'vue'

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

export function useDebounceTransition(
  source: Ref<number>,
  options: UseTransitionOptions = {},
) {
  let inTransition = $ref(false)
  const output = $(useTransition(source, {
    ...options,
    onStarted: () => inTransition = true,
    onFinished: () => inTransition = false,
  }))

  return $$({
    output,
    inTransition
  })
}
