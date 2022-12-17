import type { ComputedRef, Ref, WatchCallback, WatchOptions, WatchSource } from 'vue'
import { onMounted, ref, watch } from 'vue'
import { useElementHover } from '@vueuse/core'

export function watched<T>(value: Ref<T>, cb: WatchCallback<T>, options?: WatchOptions): Ref<T>
export function watched<T>(value: ComputedRef<T>, cb: WatchCallback<T>, options?: WatchOptions): ComputedRef<T>
export function watched<T>(value: () => T, cb: WatchCallback<T>, options?: WatchOptions): () => T

export function watched<T>(value: WatchSource<T>, cb: WatchCallback<T>, options?: WatchOptions) {
  watch(value, cb, options)
  return value
}

export function useStateCallback<T>(initial: T, cb: (arg: T) => void): [Ref<T>, (arg: T) => void] {
  const state = ref(initial) as Ref<T>
  const setState = (newValue: T) => {
    state.value = newValue
    cb(newValue)
  }
  return [state, setState]
}

export function useElHover(selectors: string): Ref<boolean> {
  let isHovered = $ref(false)
  onMounted(() => watch(useElementHover(document.querySelector(selectors)), (v) => isHovered = v))
  return $$(isHovered)
}

export function useDebounceTimeout(fn: () => void, ms = 0) {
  let timeoutID: ReturnType<typeof setTimeout>
  return function timeoutDebounce() {
    timeoutID && clearTimeout(timeoutID)
    timeoutID = setTimeout(fn, ms)
  }
}
