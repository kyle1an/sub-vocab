import type { Resource } from 'i18next'

import { pipe } from 'effect'
import i18n from 'i18next'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'
import { withAtomEffect } from 'jotai-effect'
import { atomWithStorage } from 'jotai/utils'
import { initReactI18next } from 'react-i18next'

import { tap } from '@sub-vocab/utils/lib'

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

i18n
  .use(initReactI18next)
  .use(I18nextBrowserLanguageDetector)
  .init({
    resources,
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  })

export const localeAtom = withAtomEffect(
  pipe(
    atomWithStorage('localeAtom', i18n.language, undefined, { getOnInit: true }),
    tap((x) => {
      x.debugLabel = `localeAtom`
    }),
  ),
  (get) => {
    i18n.changeLanguage(get(localeAtom)).catch(console.error)
  },
)

// https://github.com/i18next/react-i18next/issues/1483#issuecomment-2351003452
export const transParams = (s: Record<string, unknown>) => s as unknown as React.ReactNode

export default i18n
