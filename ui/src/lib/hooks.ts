import useResizeObserver from '@react-hook/resize-observer'
import { useMediaQuery } from 'foxact/use-media-query'
import { atom } from 'jotai'
import { useAtom } from 'jotai/react'
import { useState } from 'react'

import { metaThemeColorAtom, themeAtom } from '@/store/useVocab'

import { setMetaThemeColorAttribute } from './utils'

export function syncAtomWithStorage<T>(key: string, initialValue: T) {
  const stringAtom = atom(localStorage.getItem(key) ?? initialValue)

  const strAtomWithPersistence = atom(
    (get) => get(stringAtom),
    (get, set, newString: T) => {
      set(stringAtom, newString)
      localStorage.setItem(key, String(newString))
    },
  )

  return strAtomWithPersistence
}

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'

export function useDarkMode() {
  const [themePreference] = useAtom(themeAtom)
  const isDarkOS = useMediaQuery(COLOR_SCHEME_QUERY)
  let isDarkMode = false
  if (themePreference === 'dark' || (themePreference === 'auto' && isDarkOS)) {
    isDarkMode = true
  }
  return { isDarkMode }
}

export function useRect<T extends Element>(target: React.RefObject<T> | React.ForwardedRef<T> | T) {
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

export function useDrawerOpenChange() {
  const [themeColor] = useAtom(metaThemeColorAtom)
  const { isDarkMode } = useDarkMode()

  function updateMetaTheme(open: boolean) {
    let newThemeColor = themeColor
    if (open) {
      if (isDarkMode) {
        newThemeColor = 'black'
      } else {
        newThemeColor = 'transparent'
      }
    }
    setMetaThemeColorAttribute(newThemeColor)
  }

  return {
    updateMetaTheme,
  }
}
