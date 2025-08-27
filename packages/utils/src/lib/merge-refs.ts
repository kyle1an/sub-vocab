import type * as React from 'react'

export function mergeRefs<T>(
  ...inputRefs: (React.Ref<T | null> | undefined)[]
): React.RefCallback<T> {
  return (ref) => {
    for (const inputRef of inputRefs) {
      if (typeof inputRef === 'function') {
        inputRef(ref)
      } else if (inputRef) {
        inputRef.current = ref
      }
    }
  }
}
