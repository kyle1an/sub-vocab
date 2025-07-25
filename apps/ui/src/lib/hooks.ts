import { useResizeObserver } from '@react-hookz/web'
import { useEffect, useRef, useState } from 'react'

export function useRect<T extends Element>(target: React.RefObject<T | null>) {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  useResizeObserver(target, (entry) => {
    const { width, height } = entry.target.getBoundingClientRect()
    setWidth(width)
    setHeight(height)
  })
  return {
    width,
    height,
  }
}

export function useLastTruthy<T>(value: T) {
  const lastTruthy = useRef<T>(null)

  useEffect(() => {
    if (value) {
      lastTruthy.current = value
    }
  })

  if (value) {
    return value
  }

  return lastTruthy.current
}
