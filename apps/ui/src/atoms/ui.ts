import { atom } from 'jotai'

import { prefersDarkAtom, themeAtom } from '@/store/useVocab'

export const isDarkModeAtom = atom((get) => {
  const themePreference = get(themeAtom)
  const isDarkOS = get(prefersDarkAtom)
  return themePreference === 'dark' || (themePreference === 'auto' && isDarkOS)
})
