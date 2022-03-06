import 'core-js'
import Vue from 'vue'
import App from './App.vue'
import "./css/main.css";
import "./css/fonts.css";
import './css/switch.css';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';


Vue.use(ElementUI);

Vue.config.productionTip = false
Vue.config.devtools = false

new Vue({
    render: h => h(App),
}).$mount('#app')


console.log((window || global)['__core-js_shared__']?.versions)
