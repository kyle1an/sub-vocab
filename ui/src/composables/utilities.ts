import type { ComputedRef, Ref, ShallowRef, WatchCallback, WatchOptions, WatchSource } from 'vue'
import { onMounted, shallowRef, watch } from 'vue'
import { useElementHover } from '@vueuse/core'

export function watched<T>(value: Ref<T>, cb: WatchCallback<T>, options?: WatchOptions): Ref<T>
export function watched<T>(value: ComputedRef<T>, cb: WatchCallback<T>, options?: WatchOptions): ComputedRef<T>
export function watched<T>(value: () => T, cb: WatchCallback<T>, options?: WatchOptions): () => T

export function watched<T>(value: WatchSource<T>, cb: WatchCallback<T>, options?: WatchOptions) {
  watch(value, cb, options)
  return value
}

export function useState<T>(initial: T): [Readonly<ShallowRef<T>>, (arg: T) => void] {
  const state = shallowRef(initial)
  const setState = function set(newValue: T) {
    state.value = newValue
  }
  return [state, setState]
}

export function useStateCallback<T>(initial: T, cb: (arg: T) => void): [ShallowRef<T>, (arg: T) => void] {
  const state = shallowRef(initial)
  const setState = function set(newValue: T) {
    state.value = newValue
    cb(newValue)
  }
  return [state, setState]
}

export function useElHover(selectors: string) {
  const [isHovered, setIsHovered] = useState(false)
  onMounted(() => watch(useElementHover(document.querySelector(selectors)), setIsHovered))
  return isHovered
}

export function useDebounceTimeout(fn: () => void, ms = 0) {
  let timeoutID: ReturnType<typeof setTimeout>
  return function timeoutDebounce() {
    timeoutID && clearTimeout(timeoutID)
    timeoutID = setTimeout(fn, ms)
  }
}
