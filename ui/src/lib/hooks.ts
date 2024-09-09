import useResizeObserver from '@react-hook/resize-observer'
import { atom } from 'jotai'
import { atomEffect } from 'jotai-effect'
import { useState } from 'react'

import { isBackgroundScaledAtom, metaThemeColorAtom, prefersDarkAtom, themeAtom } from '@/store/useVocab'

import { setMetaThemeColorAttribute } from './utils'

export const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'

export const isDarkModeAtom = atom((get) => {
  const themePreference = get(themeAtom)
  const isDarkOS = get(prefersDarkAtom)
  let isDarkMode = false
  if (themePreference === 'dark' || (themePreference === 'auto' && isDarkOS)) {
    isDarkMode = true
  }
  return isDarkMode
})

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

export const metaThemeColorEffect = atomEffect((get) => {
  const themeColor = get(metaThemeColorAtom)
  const isDarkMode = get(isDarkModeAtom)

  const open = get(isBackgroundScaledAtom)
  let newThemeColor = themeColor
  if (open) {
    if (isDarkMode) {
      newThemeColor = 'black'
    } else {
      newThemeColor = 'transparent'
    }
  }
  setMetaThemeColorAttribute(newThemeColor)
})
