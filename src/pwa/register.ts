import { ref } from 'vue'
import {
	INSTALL_HINT_KEY,
	isIosDevice,
	isStandaloneDisplay,
	shouldAutoPromptInstall,
} from './installPrompt'

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const updateAvailable = ref(false)
export const canInstall = ref(false)
export const showInstallPrompt = ref(false)
export const isIosClient = ref(false)
export const isStandaloneClient = ref(false)
export const needsManualInstall = ref(false)

let deferredPrompt: BeforeInstallPromptEvent | null = null
let registration: ServiceWorkerRegistration | null = null
let refreshing = false
let initialized = false

const currentStandalone = () =>
	isStandaloneDisplay(
		window.matchMedia('(display-mode: standalone)').matches,
		Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
	)

const currentIos = () =>
	isIosDevice(navigator.userAgent, navigator.platform, navigator.maxTouchPoints)

const onBeforeInstall = (event: Event) => {
	event.preventDefault()
	deferredPrompt = event as BeforeInstallPromptEvent
	canInstall.value = !currentStandalone()
	needsManualInstall.value = false

	if (shouldAutoPromptInstall(
		window.location.search,
		currentStandalone(),
		Boolean(localStorage.getItem(INSTALL_HINT_KEY)),
	)) {
		showInstallPrompt.value = true
	}
}

const onAppInstalled = () => {
	deferredPrompt = null
	canInstall.value = false
	needsManualInstall.value = false
	isStandaloneClient.value = true
	showInstallPrompt.value = false
}

const requestUpdateCheck = () => {
	if (document.visibilityState && document.visibilityState !== 'visible') {
		return
	}
	void registration?.update()
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

export function applyUpdate(): void {
	registration?.waiting?.postMessage('SKIP_WAITING')
}

export async function installApp(): Promise<void> {
	if (!deferredPrompt) {
		needsManualInstall.value = !isIosClient.value
		showInstallPrompt.value = true
		return
	}

	await deferredPrompt.prompt()
	const { outcome } = await deferredPrompt.userChoice
	deferredPrompt = null
	canInstall.value = false

	if (outcome === 'accepted') {
		showInstallPrompt.value = false
		return
	}

	needsManualInstall.value = true
}

export function dismissInstallPrompt(): void {
	localStorage.setItem(INSTALL_HINT_KEY, '1')
	showInstallPrompt.value = false
}

export function openInstallPrompt(): void {
	if (isStandaloneClient.value) {
		return
	}

	needsManualInstall.value = !canInstall.value && !isIosClient.value
	showInstallPrompt.value = true
}

export function initPwa(): void {
	if (initialized || typeof window === 'undefined') {
		return
	}
	initialized = true

	isIosClient.value = currentIos()
	isStandaloneClient.value = currentStandalone()

	if (shouldAutoPromptInstall(
		window.location.search,
		isStandaloneClient.value,
		Boolean(localStorage.getItem(INSTALL_HINT_KEY)),
	)) {
		showInstallPrompt.value = true
	}

	window.addEventListener('beforeinstallprompt', onBeforeInstall)
	window.addEventListener('appinstalled', onAppInstalled)
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
