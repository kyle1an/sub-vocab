import { createI18n } from 'vue-i18n'
import Cookies from 'js-cookie'
import { en } from '@/i18n/localeMessages'
import { zh } from '@/i18n/zh'

const i18n = createI18n({
  legacy: false,
  locale: Cookies.get('_locale') || (navigator.languages[0].startsWith('zh') ? 'zh' : 'en'),
  fallbackLocale: 'en',
  messages: { en, zh }
})
const t = i18n.global.t
export { i18n, t }
