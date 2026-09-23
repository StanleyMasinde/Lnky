import './assets/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { hydrateShortDomains } from './composables/shortDomains'
import { initPwa } from './pwa/register'

const universalErrorDiv = document.querySelector('#universalErr')
let universalErrorTimer: ReturnType<typeof setTimeout> | undefined

// Skill dwell: surface for 6 s, then slide away on its own.
function showUniversalError(message: string) {
	if (!(universalErrorDiv instanceof HTMLElement)) return
	universalErrorDiv.hidden = false
	universalErrorDiv.textContent = message
	if (universalErrorTimer) clearTimeout(universalErrorTimer)
	universalErrorTimer = setTimeout(() => {
		universalErrorDiv.hidden = true
	}, 6000)
}

window.onerror = function (
	message: string | Event,
	source?: string,
	lineno?: number,
	colno?: number,
): boolean {
	showUniversalError(`Error: ${message} at ${source}:${lineno}:${colno}`)

	return true
}

window.addEventListener('unhandledrejection', (event) => {
	showUniversalError(`Unhandled Promise Rejection: ${event.reason}`)
})

initPwa()
void hydrateShortDomains()

const app = createApp(App)

app.use(router)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.config.errorHandler = (err, instance, info): void => {
	// @ts-expect-error This is fine
	showUniversalError(`Vue Error: ${err.message}`)
}

app.mount('#app')
