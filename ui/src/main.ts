import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import '@/main.css'
import 'element-plus/dist/index.css'
import router from '@/router'

const app = createApp(App)
app.use(VueQueryPlugin)
app.use(createPinia())
app.use(router)
app.mount('#app')
