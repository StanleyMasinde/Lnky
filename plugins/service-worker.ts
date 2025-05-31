export default defineNuxtPlugin(nuxtApp => {
	// Register the service worker
	if (import.meta.env.PROD && navigator.serviceWorker) {
		navigator.serviceWorker.register('/sw.js')
	}
})
