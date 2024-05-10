import { atom } from 'jotai'
import { useAtom } from 'jotai/react'
import { useIsomorphicLayoutEffect, useLocalStorage, useMediaQuery } from 'usehooks-ts'
import { themeAtom } from '@/store/useVocab'

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
  const [isDarkMode, setDarkMode] = useLocalStorage(
    'isDarkMode',
    isDarkOS ?? false,
  )

  useIsomorphicLayoutEffect(() => {
    if (themePreference === 'auto') {
      if (isDarkMode !== isDarkOS) {
        setDarkMode(isDarkOS)
      }
    } else {
      const preferDark = themePreference === 'dark'
      if (isDarkMode !== preferDark) {
        setDarkMode(preferDark)
      }
    }
  }, [themePreference, isDarkOS, isDarkMode, setDarkMode])

  return isDarkMode
}
