import { useState } from 'react'

export function useStickyValue<T>(
  value: T,
  predicate: (v: T) => boolean = Boolean,
): T {
  const [sticky, setSticky] = useState<T>(value)

  if (value !== sticky && predicate(value)) {
    setSticky(value)
  }

  return predicate(value) ? value : sticky
}
