import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Cookies from 'js-cookie'
import { en } from './en'
import { zh } from './zh'

/**
 *  Interpolation for `t` - see https://github.com/i18next/react-i18next/issues/1483
 */
export type TI = any

export const lng = Cookies.get('_locale') || (navigator.languages[0].startsWith('zh') ? 'zh' : 'en')

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      zh: {
        translation: zh,
      },
    },
    lng,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  })
  .catch(console.error)

export default i18n
