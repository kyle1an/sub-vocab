import type { Resource } from 'i18next'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { localeAtom } from '@/store/useVocab'

import { en } from './en'
import { zh } from './zh'

export function getLanguage() {
  if (typeof window !== 'undefined') {
    const [language] = window.navigator.languages
    if (language && language.startsWith('zh'))
      return 'zh'
  }
  return 'en'
}

export const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
} as const satisfies Resource

export function useI18n() {
  const [locale] = useAtom(localeAtom)
  useState(() => {
    i18n.use(initReactI18next)
      .init({
        resources,
        lng: locale,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
        },
      })
      .catch(console.error)
  })
  return i18n
}

// https://github.com/i18next/react-i18next/issues/1483#issuecomment-2351003452
export const transParams = (s: Record<string, unknown>) => s as unknown as React.ReactNode

export default i18n
