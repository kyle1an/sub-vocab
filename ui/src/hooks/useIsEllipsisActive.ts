import { useEffect, useRef, useState } from 'react'

import { useRect } from '@/lib/hooks'

// https://stackoverflow.com/a/60073230
function getTextWidth<T extends Element>(el: T | null, textContent: string) {
  if (!el) return 0
  const styles = getComputedStyle(el)
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return 0
  ctx.font = `${styles.fontSize} ${styles.fontFamily}`
  ctx.letterSpacing = `${styles.letterSpacing}`
  const text = ctx.measureText(textContent)
  return text.width
}

export function useIsEllipsisActive<T extends Element>() {
  const elementRef = useRef<T>(null)
  const { width } = useRect(elementRef)
  const textContent = elementRef.current?.textContent ?? ''
  const [textWidth, setTextWidth] = useState(0)
  useEffect(() => {
    requestAnimationFrame(() => {
      const tWidth = getTextWidth(elementRef.current, textContent)
      if (tWidth !== textWidth) {
        setTextWidth(tWidth)
      }
    })
  }, [elementRef, textContent, textWidth])
  return [elementRef, textWidth > width] as const
}
