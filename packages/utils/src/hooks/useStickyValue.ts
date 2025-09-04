import { useState } from 'react'

export function useStickyValue<T>(
  value: T,
  predicate: (v: T) => boolean = Boolean,
): T {
  const [sticky, setSticky] = useState<T>(value)
  const isValid = predicate(value)
  if (sticky !== value && isValid) {
    setSticky(value)
  }
  return isValid ? value : sticky
}
