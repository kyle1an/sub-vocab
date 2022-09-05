import type { ComputedRef, Ref, WatchCallback, WatchOptions, WatchSource } from 'vue'
import { watch } from 'vue'

export function watched<T>(value: Ref<T>, cb: WatchCallback<T>, options?: WatchOptions): Ref<T>
export function watched<T>(value: ComputedRef<T>, cb: WatchCallback<T>, options?: WatchOptions): ComputedRef<T>
export function watched<T>(value: () => T, cb: WatchCallback<T>, options?: WatchOptions): () => T

export function watched<T>(value: WatchSource<T>, cb: WatchCallback<T>, options?: WatchOptions) {
  watch(value, cb, options)
  return value
}
