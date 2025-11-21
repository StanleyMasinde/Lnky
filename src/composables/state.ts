import { ref } from 'vue'

const isLoading = ref(false)

// Toast state
const toastMessage = ref<string | null>(null)
const toastVisible = ref(false)

export function useIsLoading() {
	return isLoading
}

export function useToast() {
	const showToast = (message: string, duration = 3000) => {
		toastMessage.value = message
		toastVisible.value = true
		setTimeout(() => {
			toastVisible.value = false
			// clear message after hide for a clean state
			setTimeout(() => (toastMessage.value = null), 200)
		}, duration)
	}

	return {
		toastMessage,
		toastVisible,
		showToast,
	}
}
