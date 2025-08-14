import type { Resource } from 'i18next'

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { withAtomEffect } from 'jotai-effect'
import { atomWithStorage } from 'jotai/utils'

import { en } from './en'
import { zh } from './zh'

export const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
} as const satisfies Resource

i18n.use(LanguageDetector).init({
  resources,
  interpolation: {
    escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
  },
})

export const localeAtom = withAtomEffect(
  (() => {
    const newAtom = atomWithStorage('localeAtom', i18n.language, undefined, { getOnInit: true })
    newAtom.debugLabel = `localeAtom`
    return newAtom
  })(),
  (get) => {
    i18n.changeLanguage(get(localeAtom)).catch(console.error)
  },
)

// https://github.com/i18next/react-i18next/issues/1483#issuecomment-2351003452
export const transParams = (s: Record<string, unknown>) => s as unknown as React.ReactNode

export default i18n
