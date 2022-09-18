import { createI18n } from 'vue-i18n'
import Cookies from 'js-cookie'
import { messages } from '@/i18n/localeMessages'

const i18n = createI18n({
  legacy: false,
  locale: Cookies.get('_locale') || (navigator.languages[0].startsWith('zh') ? 'zh' : 'en'),
  fallbackLocale: 'en',
  messages
})
const t = i18n.global.t
export { i18n, t }
