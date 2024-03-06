import './assets/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Register the service worker
if (process.env.NODE_ENV !== 'development' && navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js')
}

const app = createApp(App)

app.use(router)

app.mount('#app')
