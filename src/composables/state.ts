import { ref } from 'vue'

const isLoading = ref(false)

export function useIsLoading() {
	return isLoading
}
