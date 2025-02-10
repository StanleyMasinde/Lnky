import './assets/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Register the service worker
if (import.meta.env.PROD && navigator.serviceWorker) {
	navigator.serviceWorker.register('/sw.js')
}

// Create an IndexedDb Database
const request = window.indexedDB.open('linksDb', 1)

request.onsuccess = (event) => {
	// The DB is available and it is the current version
	console.log('IDB database opened', event.target)
}

request.onerror = (event) => {
	// TODO: properly handle this
	console.error('Ooops, could not open the db', event.target)
}

// The user has no DB or we have upgraded the version
// The current logic only assumes the former case –– New DB
request.onupgradeneeded = (event) => {
	const database = (event.target as IDBOpenDBRequest)?.result as IDBDatabase

	// Create the DB schema
	const objectStore = database.createObjectStore('links', { autoIncrement: true })

	objectStore.createIndex('url', 'url', { unique: true })

	objectStore.createIndex('createdAt', 'createdAt')
}

const app = createApp(App)

app.use(router)

app.mount('#app')
