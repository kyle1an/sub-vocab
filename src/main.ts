import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import Cookies from 'js-cookie'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style/main.css'
import 'element-plus/dist/index.css'
import router from './router'
import { messages } from './utils/localeMessages'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(createI18n({
  legacy: false,
  locale: Cookies.get('_locale') || (navigator.languages[0].startsWith('zh') ? 'zh' : 'en'),
  fallbackLocale: 'en',
  messages
}))

app.mount('#app')
