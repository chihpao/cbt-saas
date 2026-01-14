import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'   // << 把 tailwind 載入

// 確保 DOM 完全載入後再掛載 Vue 應用程式
document.addEventListener('DOMContentLoaded', () => {
  createApp(App)
    .use(createPinia())
    .use(router)
    .mount('#app')
})
