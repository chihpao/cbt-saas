import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'   // << 把 tailwind 載入

createApp(App).use(createPinia()).use(router).mount('#app')
