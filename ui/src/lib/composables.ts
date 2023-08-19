import { onMounted, shallowRef, triggerRef, watch } from 'vue'
import { useElementHover } from '@vueuse/core'

type ValueOrFn<T> = T | ((arg: T) => T)

export function createSignal<T>(initialValue: T, options?: {
  equals?: false | ((prev: T, next: T) => boolean)
}) {
  const r = shallowRef(initialValue)
  const getNewValue = (valueOrFn: ValueOrFn<T>) => valueOrFn instanceof Function ? valueOrFn(r.value) : valueOrFn

  function set(): (valueOrFn: ValueOrFn<T>) => void {
    if (options === undefined) {
      return (valueOrFn) => {
        r.value = getNewValue(valueOrFn)
      }
    }

    if (options.equals === false) {
      return (valueOrFn) => {
        r.value = getNewValue(valueOrFn)
        triggerRef(r)
      }
    }

    if (typeof options.equals === 'function') {
      const equals = options.equals
      return (valueOrFn) => {
        const newValue = getNewValue(valueOrFn)
        const isTrigger = equals(r.value, newValue)
        r.value = newValue
        if (isTrigger) triggerRef(r)
      }
    }

    return (valueOrFn) => {
      r.value = getNewValue(valueOrFn)
    }
  }

  return [() => r.value, set()] as const
}

export function useElHover(selectors: string) {
  const [isHovered, setIsHovered] = createSignal(false)
  onMounted(() => {
    watch(useElementHover(document.querySelector(selectors)), setIsHovered)
  })
  return isHovered
}

export function useDebounceTimeout(fn: () => void, ms = 0) {
  let timeoutID: ReturnType<typeof setTimeout>
  return function timeoutDebounce() {
    timeoutID && clearTimeout(timeoutID)
    timeoutID = setTimeout(fn, ms)
  }
}
