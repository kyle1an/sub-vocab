import { createApp } from 'vue'
import App from './App.vue'
import './style/main.css';
import './style/fonts.css';

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia';

const app = createApp(App)
app.use(ElementPlus)
app.use(createPinia())

// app.config.productionTip = false
// app.config.devtools = false

app.mount('#app')
