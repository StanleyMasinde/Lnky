<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
	<main class="content-page app-main mx-auto w-full max-w-prose px-5 pb-10 pt-8 md:pt-12">
		<h1 class="text-xl font-bold">No such page.</h1>
		<p class="mt-6 leading-[1.65]">
			Nothing lives at <span class="font-mono text-[0.9em]">{{ route.path }}</span>.
			It may have been a cleaned link that lost its way, or an address typed
			from memory.
		</p>
		<p class="mt-4 leading-[1.65]">
			<router-link class="font-semibold text-accent underline underline-offset-4 hover:text-ink" to="/">Take me back</router-link>.
		</p>
	</main>
</template>
