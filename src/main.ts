import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import '@/style/main.css'
import 'element-plus/dist/index.css'
import router from '@/router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
