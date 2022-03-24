import { createApp } from 'vue'
import App from './App.vue'
import './style/main.css';
import './style/fonts.css';

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(ElementPlus)

app.config.productionTip = false
// app.config.devtools = false

app.mount('#app')
