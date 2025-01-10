import { useResizeObserver } from '@react-hookz/web'
import { atomEffect } from 'jotai-effect'

import { setMetaThemeColorAttribute } from '@/lib/utils'
import { isDrawerOpenAtom, isMdScreenAtom, metaThemeColorAtom, prefersDarkAtom, themeAtom } from '@/store/useVocab'

export const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)'

export const isDarkModeAtom = atom((get) => {
  const themePreference = get(themeAtom)
  const isDarkOS = get(prefersDarkAtom)
  let isDarkMode = false
  if (themePreference === 'dark' || (themePreference === 'auto' && isDarkOS))
    isDarkMode = true
  return isDarkMode
})

export function useRect<T extends Element>(target: React.RefObject<T> | T | null) {
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

  const open = get(isDrawerOpenAtom)
  const isMdScreen = get(isMdScreenAtom)
  let newThemeColor = themeColor
  if (open && !isMdScreen) {
    if (isDarkMode)
      newThemeColor = 'black'
    else
      newThemeColor = 'transparent'
  }
  setMetaThemeColorAttribute(newThemeColor)
})

export function useLastTruthy<T>(value: T) {
  const lastTruthy = useRef<T>(null)

  useEffect(() => {
    if (value)
      lastTruthy.current = value
  })

  if (value)
    return value

  // eslint-disable-next-line react-compiler/react-compiler
  return lastTruthy.current
}
