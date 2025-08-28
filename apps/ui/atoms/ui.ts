import { atom } from 'jotai'

import { prefersDarkAtom, themeAtom } from '@/atoms'

export const isDarkModeAtom = atom((get) => {
  const setting = get(themeAtom)
  return setting === 'dark' || (setting === 'auto' && get(prefersDarkAtom))
})
