import App from './App.vue'
import './style/main.css'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import router from './router'
import Cookies from 'js-cookie'
import { createI18n } from 'vue-i18n'
import { messages } from './utils/localeMessages'
import { createApp } from 'vue'

const app = createApp(App)
app.use(ElementPlus)
app.use(createPinia())
// Make sure to _use_ the router instance to make the whole app router-aware.
app.use(router)
app.use(createI18n({
  locale: Cookies.get('lang') || 'zh',
  fallbackLocale: 'en',
  messages
}))
// app.config.productionTip = false
// app.config.devtools = false

app.mount('#app')
