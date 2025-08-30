import { atom } from 'jotai'

import { mediaQueryFamily, themeAtom } from '@/atoms'

export const isDarkModeAtom = atom((get) => {
  const setting = get(themeAtom)
  return setting === 'dark' || (setting === 'auto' && get(mediaQueryFamily('(prefers-color-scheme: dark)')))
})
