import { ref } from 'vue'

const INSTALL_HINT_KEY = 'lnky.dismissedInstallHint'

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const updateAvailable = ref(false)
export const canInstall = ref(false)
export const showIosInstallHint = ref(false)

let deferredPrompt: BeforeInstallPromptEvent | null = null
let registration: ServiceWorkerRegistration | null = null
let refreshing = false
let initialized = false

const isStandalone = () =>
	window.matchMedia('(display-mode: standalone)').matches
	|| Boolean((navigator as Navigator & { standalone?: boolean }).standalone)

const isIos = () => {
	const ua = navigator.userAgent
	return /iphone|ipad|ipod/i.test(ua)
		|| (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

const watchWorker = (worker: ServiceWorker | null) => {
	if (!worker) {
		return
	}

	worker.addEventListener('statechange', () => {
		if (worker.state !== 'installed') {
			return
		}

		if (navigator.serviceWorker.controller) {
			updateAvailable.value = true
			return
		}

		worker.postMessage('SKIP_WAITING')
	})
}

const onBeforeInstall = (event: Event) => {
	event.preventDefault()
	deferredPrompt = event as BeforeInstallPromptEvent
	canInstall.value = !isStandalone()
}

const requestUpdateCheck = () => {
	if (document.visibilityState && document.visibilityState !== 'visible') {
		return
	}
	void registration?.update()
}

export function applyUpdate(): void {
	registration?.waiting?.postMessage('SKIP_WAITING')
}

export async function installApp(): Promise<void> {
	if (!deferredPrompt) {
		return
	}

	await deferredPrompt.prompt()
	await deferredPrompt.userChoice
	deferredPrompt = null
	canInstall.value = false
}

export function dismissIosInstallHint(): void {
	localStorage.setItem(INSTALL_HINT_KEY, '1')
	showIosInstallHint.value = false
}

export function initPwa(): void {
	if (initialized || typeof window === 'undefined') {
		return
	}
	initialized = true

	if (!isStandalone() && isIos() && !localStorage.getItem(INSTALL_HINT_KEY)) {
		showIosInstallHint.value = true
	}

	window.addEventListener('beforeinstallprompt', onBeforeInstall)
	document.addEventListener('visibilitychange', requestUpdateCheck)
	window.addEventListener('focus', requestUpdateCheck)

	if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
		return
	}

	void navigator.serviceWorker.register('/sw.js').then((reg) => {
		registration = reg

		if (reg.waiting && navigator.serviceWorker.controller) {
			updateAvailable.value = true
		}

		watchWorker(reg.installing)
		reg.addEventListener('updatefound', () => {
			watchWorker(reg.installing)
		})

		void reg.update()
	})

	navigator.serviceWorker.addEventListener('controllerchange', () => {
		if (!updateAvailable.value || refreshing) {
			return
		}
		refreshing = true
		window.location.reload()
	})
}
