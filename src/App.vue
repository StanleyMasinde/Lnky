<script setup lang="ts">
import { RouterView } from 'vue-router'
const version = __APP_VERSION__
</script>

<template>
	<!-- Navigation -->
	<div class="flex justify-center gap-2 mb-4 sticky top-0 bg-white dark:bg-neutral-900 p-3 rounded-md shadow-sm sm:px-32 md:px-40">
		<RouterLink data-cy="home-link" active-class="bg-primary text-white" to="/"
			class="w-full text-center p-2 rounded-lg font-semibold text-sm transition duration-200 hover:bg-primary hover:text-white">
			Home
		</RouterLink>
		<RouterLink data-cy="saved-links-link" to="/saved-links" active-class="bg-primary text-white"
			class="w-full text-center p-2 rounded-lg font-semibold text-sm transition duration-200 hover:bg-primary hover:text-white">
			Saved Links
		</RouterLink>
	</div>

	<RouterView v-slot="{ Component }">
		<Transition enter-from-class="translate-x-[150%] opacity-0" leave-to-class="translate-x-[150%] opacity-0"
			enter-active-class="transition duration-300" leave-active-class="transition duration-300">
			<component :is="Component" />
		</Transition>
	</RouterView>

	<footer class="text-sm text-gray-500 text-center p-4">
		App version: {{ version }}
	</footer>
</template>
