<script setup lang="ts">
import { RouterView } from 'vue-router'
const version = __APP_VERSION__
</script>

<template>
	<header></header>

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
