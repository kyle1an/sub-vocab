import { useState } from 'react'

export function useIsEllipsisActive<T extends HTMLElement>() {
  const [isEllipsisActive, setIsEllipsisActive] = useState(false)

  function handleOnMouseOver(ev: React.MouseEvent<T>) {
    const el = ev.target as T
    // https://stackoverflow.com/a/10017343
    const isActive = el.offsetWidth < el.scrollWidth
    if (isEllipsisActive !== isActive) {
      setIsEllipsisActive(isActive)
    }
  }

  return [isEllipsisActive, handleOnMouseOver] as const
}
