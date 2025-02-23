<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
	<header></header>

	<RouterView v-slot="{ Component }">
		<Transition enter-from-class="translate-x-[150%] opacity-0" leave-to-class="translate-x-[150%] opacity-0"
			enter-active-class="transition duration-300" leave-active-class="transition duration-300">
			<component :is="Component" />
		</Transition>
	</RouterView>
</template>
