import './assets/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Register the service worker
if (import.meta.env.PROD && navigator.serviceWorker) {
	navigator.serviceWorker.register('/sw.js')
}

const app = createApp(App)

app.use(router)

app.mount('#app')
