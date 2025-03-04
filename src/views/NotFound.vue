<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
	<div class="h-screen flex flex-col justify-center align-center">
		<div class="m-5">
			<h1 class="text-3xl font-bold">Page not found</h1>
			<p>The resouce you clicked could not be found on this server. Resource <b>{{ route.path }}</b> does not live here.</p>
			<router-link class="hover:underline text-primary" to="/">Take me back</router-link>
		</div>
	</div>
</template>
