import i18n, { use } from 'i18next'
import { initReactI18next } from 'react-i18next'
import Cookies from 'js-cookie'
import { en } from './en'
import { zh } from './zh'

/**
 *  Interpolation for `t` - see https://github.com/i18next/react-i18next/issues/1483
 */
export type TI = any

export function getLanguage() {
  const cookieLang = Cookies.get('_locale')
  if (cookieLang) {
    return cookieLang
  }
  if (navigator.languages[0]) {
    if (navigator.languages[0].startsWith('zh')) {
      return 'zh'
    }
  }
  return 'en'
}

use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      zh: {
        translation: zh,
      },
    },
    lng: getLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  })
  .catch(console.error)

export default i18n
