import { createApp } from 'vue'
import App from './App.vue'
import './style/main.css';
import './style/fonts.css';

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia';
import router from './router'
import { getCookie } from './utils/cookie';
import { createI18n } from 'vue-i18n'
import { messages } from './utils/localeMessages';

const i18n = createI18n({
  locale: getCookie('lang') || 'zh', // set locale
  fallbackLocale: 'en', // set fallback locale
  messages, // set locale messages
})

const app = createApp(App)
app.use(ElementPlus)
app.use(createPinia())
// Make sure to _use_ the router instance to make the whole app router-aware.
app.use(router)
app.use(i18n)
// app.config.productionTip = false
// app.config.devtools = false

app.mount('#app')

