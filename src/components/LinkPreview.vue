<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const props = defineProps<{
	url: string
	timestamp: string
}>()

const title = ref<string | undefined>()
const image = ref<string | undefined>()
const description = ref<string | undefined>()

watchEffect(async () => {
	if (!props.url) return
	const proxyUrl = new URL(`https://lnky.api.stanleymasinde.com`)
	proxyUrl.pathname = 'proxy'
	proxyUrl.search = `url=${props.url}`
	const res = await fetch(proxyUrl, {
		mode: 'cors',
	})
	const htmlRes = await res.text()
	const domParser = new DOMParser()
	const parsed = domParser.parseFromString(htmlRes, 'text/html')
	title.value = parsed.title
	image.value
		= parsed.querySelector('meta[property="og:image"], meta[name="twitter:image"], meta[itemprop="image"]')
			?.getAttribute('content')
			|| undefined
	description.value
		= parsed.querySelector('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]')
			?.getAttribute('content')
			|| undefined
})
</script>

<template>
	<div class="flex flex-col md:flex-row items-center space-x-4 p-4 border rounded-lg w-full overflow-y-scroll">
		<div v-if="image">
			<img :src="image" alt="Preview Image" class="rounded-md object-cover" />
		</div>
		<div class="flex flex-col w-full md:w-[50%]">
			<h1 id="title" class="font-semibold text-lg line-clamp-2">{{ title || 'Title not available' }}</h1>
			<p id="description" class="text-sm text-gray-600 line-clamp-3">{{ description || 'Description not available'
			}}</p>

			<a class="text-lg underline hover:text-primary line-clamp-1" :href="url" target="_blank">
				{{ url }}
			</a>

			<small class="text-xs font-semibold">{{ new Date(timestamp) }}</small>
		</div>
	</div>
</template>
