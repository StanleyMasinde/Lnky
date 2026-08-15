import './assets/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { hydrateShortDomains } from './composables/shortDomains'
import { initPwa } from './pwa/register'

const universalErrorDiv = document.querySelector('#universalErr')

window.onerror = function (
	message: string | Event,
	source?: string,
	lineno?: number,
	colno?: number,
): boolean {
	if (universalErrorDiv instanceof HTMLElement) {
		universalErrorDiv.hidden = false
		universalErrorDiv.textContent = `Error: ${message} at ${source}:${lineno}:${colno}`
	}

	return true
}

window.addEventListener('unhandledrejection', (event) => {
	if (universalErrorDiv instanceof HTMLElement) {
		universalErrorDiv.textContent = `Unhandled Promise Rejection: ${event.reason}`
	}
})

initPwa()
void hydrateShortDomains()

const app = createApp(App)

app.use(router)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.config.errorHandler = (err, instance, info): void => {
	if (universalErrorDiv instanceof HTMLElement) {
		universalErrorDiv.hidden = false
		// @ts-expect-error This is fine
		universalErrorDiv.textContent = `Vue Error: ${err.message}`
	}
}

app.mount('#app')
