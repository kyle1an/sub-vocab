import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { localeAtom, store } from '../store/useVocab'
import { en } from './en'
import { zh } from './zh'

/**
 *  Interpolation for `t` - see https://github.com/i18next/react-i18next/issues/1483
 */
export type TI = any

export function getLanguage() {
  if (navigator.languages[0]) {
    if (navigator.languages[0].startsWith('zh')) {
      return 'zh'
    }
  }
  return 'en'
}

i18n.use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      zh: {
        translation: zh,
      },
    },
    lng: store.get(localeAtom),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  })
  .catch(console.error)

// https://github.com/i18next/react-i18next/issues/1483#issuecomment-2351003452
export const transParams = (s: Record<string, unknown>) => s as unknown as React.ReactNode

export default i18n
