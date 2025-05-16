<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{
	url: string
}>()

const title = ref<string | undefined>()
const image = ref<string | undefined>()
const description = ref<string | undefined>()

onMounted(async () => {
	const res = await fetch(props.url)
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
	<div class="link-preview flex items-center space-x-4 p-4 border rounded-lg shadow-md max-w-md">
		<img v-if="image" :src="image" alt="Preview Image" class="w-20 h-20 rounded-md object-cover" />
		<div class="flex flex-col flex-1">
			<h1 id="title" class="font-semibold text-lg line-clamp-2">{{ title || 'Title not available' }}</h1>
			<p id="description" class="text-sm text-gray-600 line-clamp-3">{{ description || 'Description not available'
			}}</p>
			<div class="line-clamp-1">
				<a class="text-lg underline hover:text-primary" :href="url" target="_blank">
					{{ url }}
				</a>
			</div>
		</div>
	</div>
</template>
