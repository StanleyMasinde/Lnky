<script setup lang="ts">
const version = __APP_VERSION__
</script>

<template>
  <div>
	<header/>

<slot/>
	<footer class="text-sm text-gray-500 text-center p-4">
		App version: {{ version }}
	</footer>
  </div>
</template>

