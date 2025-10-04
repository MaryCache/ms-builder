import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css' // ← Tailwind/共通CSSを読み込み

createApp(App).use(router).mount('#app')
