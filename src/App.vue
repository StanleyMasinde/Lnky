<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
	<header></header>
	<Transition enter-active-class="duration-1500 ease-out" enter-from-class="transform opacity-0"
		enter-to-class="opacity-100" leave-active-class="duration-500 ease-in" leave-from-class="opacity-100"
		leave-to-class="transform opacity-0">
		<RouterView />
	</Transition>
</template>
