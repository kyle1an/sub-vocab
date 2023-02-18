import { onMounted, shallowRef, triggerRef, watch } from 'vue'
import { useElementHover } from '@vueuse/core'
import produce, { Draft } from 'immer'

export function useImmer<T>(baseState: T) {
  const state = shallowRef(baseState)
  const update = (updater: (arg: Draft<T>) => void) => {
    state.value = produce(state.value, updater)
  }

  return [state, update] as const
}

export function createSignal<T>(initialValue: T, options?: { equals?: false | ((prev: T, next: T) => boolean) }) {
  const r = shallowRef(initialValue)
  const get = () => r.value
  const set = (v: (arg: T) => T) => {
    r.value = typeof v === 'function' ? v(r.value) : v
    if (options?.equals === false) triggerRef(r)
  }
  return [get, set] as const
}

export function useState<T>(initial: T) {
  const state = shallowRef(initial)
  const setState = function set(newValue: T) {
    state.value = newValue
  }
  return [state, setState] as const
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
