<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { useToast } from '@/composables/state'
declare const __APP_VERSION__: string | undefined
const version = __APP_VERSION__ ?? import.meta.env.VITE_APP_VERSION ?? 'dev'

const { toastVisible, toastMessage } = useToast()
</script>

<template>
	<header class="bg-white/80 dark:bg-neutral-900/80 backdrop-blur sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800">
		<div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
					<RouterLink to="/" class="flex items-center gap-3">
						<img src="/icons/favicon.ico" alt="Lnky logo" class="w-10 h-10 rounded-md object-cover" />
						<span class="font-semibold text-lg">Lnky</span>
					</RouterLink>

			<nav class="flex items-center gap-4">
				<RouterLink to="/" class="text-sm text-gray-600 dark:text-gray-300 hover:underline">Home</RouterLink>
				<RouterLink to="/saved-links" class="text-sm text-gray-600 dark:text-gray-300 hover:underline">Saved</RouterLink>
				<RouterLink to="/about" class="text-sm text-gray-600 dark:text-gray-300 hover:underline">About</RouterLink>
			</nav>
		</div>
	</header>

	<RouterView v-slot="{ Component }">
		<Transition enter-from-class="translate-x-[150%] opacity-0" leave-to-class="translate-x-[150%] opacity-0"
			enter-active-class="transition duration-300" leave-active-class="transition duration-300">
			<component :is="Component" />
		</Transition>
	</RouterView>

	<footer class="text-sm text-gray-500 text-center p-6 mt-12">
		<div class="max-w-6xl mx-auto px-4">App version: {{ version }}</div>
	</footer>

	<!-- Global toast -->
	<div v-if="toastVisible" class="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50">
		{{ toastMessage }}
	</div>
</template>
