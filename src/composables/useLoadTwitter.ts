import { ref } from 'vue'

const isTwitterWidgetLoaded = ref(false)

export async function useTweetWidget() {
	if (isTwitterWidgetLoaded.value) {
		window.twttr?.widgets.load()
		return
	}

	await loadTwitterScript()
	window.twttr?.widgets.load()
	isTwitterWidgetLoaded.value = true
}

function loadTwitterScript() {
	return new Promise<void>((resolve) => {
		const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')
		if (existingScript) {
			existingScript.addEventListener('load', () => resolve())
			return
		}

		const script = document.createElement('script')
		script.src = 'https://platform.twitter.com/widgets.js'
		script.async = true
		script.onload = () => resolve()
		document.body.appendChild(script)
	})
}
