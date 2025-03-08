import './assets/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const shortDomainsReq = await fetch('https://raw.githubusercontent.com/PeterDaveHello/url-shorteners/refs/heads/master/list')
const resText = await shortDomainsReq.text()
const shortDomains = resText.split('\n').filter(d => URL.canParse(`https://${d}`))

// Init and empty IDB variable
let currentDB: IDBDatabase | undefined

// Register the service worker
if (import.meta.env.PROD && navigator.serviceWorker) {
	navigator.serviceWorker.register('/sw.js')
}

// indexedDB open request
const request = window.indexedDB.open('linksDb', 2)

request.onsuccess = (event) => {
	console.log('DB opened')
	currentDB = (event.target as IDBOpenDBRequest).result as IDBDatabase
	const transation = currentDB.transaction('shortLinks', 'readwrite')
	const shortLinksStore = transation.objectStore('shortLinks')

	for (let index = 0; index < shortDomains.length; index++) {
		const domain = shortDomains[index]
		shortLinksStore.put({ domain: domain })
	}
}

request.onerror = (event) => {
	// TODO: properly handle this
	console.error('Ooops, could not open the db', event.target)
}

// The user has no DB or we have upgraded the version
// The current logic only assumes the former case –– New DB
request.onupgradeneeded = (event) => {
	const database = (event.target as IDBOpenDBRequest)?.result as IDBDatabase
	console.log(`Upgrading to version ${database.version}`)

	if (!database.objectStoreNames.contains('links')) {
		const objectStore = database.createObjectStore('links', { autoIncrement: true })
		objectStore.createIndex('url', 'url', { unique: true })
		objectStore.createIndex('createdAt', 'createdAt')
	}

	if (!database.objectStoreNames.contains('shortLinks')) {
		const shortLinksStore = database.createObjectStore('shortLinks', { autoIncrement: true })
		shortLinksStore.createIndex('domain', 'domain', { unique: true })
	}
}

const app = createApp(App)

app.use(router)

app.mount('#app')
