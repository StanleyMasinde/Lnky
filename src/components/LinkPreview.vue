<script setup lang="ts">
import { ref, watchEffect } from 'vue'

interface TwitterEmbed {
	url: string
	title: string
	html: string
	width: number | null
	height: number | null
	type: 'rich'
	cache_age: string
	provider_name: 'Twitter'
	provider_url: string
	version: '1.0'
}

const props = defineProps<{ url: string, timestamp: string }>()
const title = ref<string | undefined>()
const image = ref<string | undefined>()
const description = ref<string | undefined>()
const isTweet = ref<boolean>(false)
const tweetEmbedHtml = ref<string | undefined>()
const video = ref<string | undefined>()

watchEffect(async () => {
	if (!props.url) return

	const proxyUrl = new URL(`https://lnky.api.stanleymasinde.com`)
	proxyUrl.pathname = 'proxy'

	const isTweetUrl = /^(https?:\/\/)?(twitter\.com|x\.com)\/[^/]+\/status\/\d+/.test(props.url)
	if (isTweetUrl) {
		const twitterEmbedURL = new URL('https://publish.twitter.com/oembed')
		isTweet.value = true

		twitterEmbedURL.searchParams.set('url', props.url)
		proxyUrl.searchParams.set('url', twitterEmbedURL.toString())

		const res = await fetch(proxyUrl.toString(), { mode: 'cors' })
		const embedRes = (await res.json()) as TwitterEmbed

		tweetEmbedHtml.value = embedRes.html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
	}
	else {
		proxyUrl.search = `url=${props.url}`
	}

	const res = await fetch(proxyUrl, { mode: 'cors' })
	const htmlRes = await res.text()
	const domParser = new DOMParser()
	const parsed = domParser.parseFromString(htmlRes, 'text/html')

	title.value = parsed.title
	image.value = parsed
		.querySelector(
			'meta[property="og:image"], meta[name="twitter:image"], meta[itemprop="image"]',
		)
		?.getAttribute('content') || undefined
	description.value = parsed
		.querySelector(
			'meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]',
		)
		?.getAttribute('content') || undefined

	// Detect video meta tags
	video.value = parsed
		.querySelector(
			'meta[property="og:video"], meta[name="twitter:player"], meta[itemprop="video"]',
		)
		?.getAttribute('content') || undefined
})
</script>

<template>
	<!-- Twitter Embed -->
	<div v-if="isTweet"
		class="p-4 rounded-lg shadow-md dark:bg-neutral-900 max-w-[600px] w-full overflow-x-auto mx-auto"
		style="min-width: 320px;">
		<div v-html="tweetEmbedHtml" class="prose dark:prose-invert" style="min-width: 550px;"></div>

		<small class="text-xs font-semibold mt-2 text-gray-500 block text-right">
			{{ new Date(props.timestamp).toLocaleString() }}
		</small>
	</div>

	<!-- Video Preview -->
	<div v-else-if="video" class="flex flex-col items-center p-4 border rounded-lg w-full overflow-hidden">
		<video :src="video" controls style="max-width:100%; border-radius:8px; max-height:320px; background:#000;" />
		<div class="flex flex-col w-full mt-4">
			<h1 id="title" class="font-semibold text-lg line-clamp-3">
				{{ title || 'Title not available' }}
			</h1>
			<p id="description" class="text-sm text-gray-600 line-clamp-5 mt-2">
				{{ description || 'Description not available' }}
			</p>
			<a class="text-primary underline hover:text-primary text-sm mt-2 line-clamp-1" :href="props.url"
				target="_blank">
				{{ props.url }}
			</a>
			<small class="text-xs font-semibold mt-2 text-gray-500">
				{{ new Date(props.timestamp).toLocaleString() }}
			</small>
		</div>
	</div>

	<!-- OG Metadata Preview (Non-Twitter URLs) -->
	<div v-else
		class="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 p-4 border rounded-lg w-full overflow-hidden">
		<div v-if="image" class="w-full md:w-[40%] flex-shrink-0">
			<img :src="image" alt="Preview Image" class="w-full h-auto max-h-48 rounded-md object-cover" />
		</div>
		<div class="flex flex-col w-full md:w-[60%]">
			<h1 id="title" class="font-semibold text-lg line-clamp-3">
				{{ title || 'Title not available' }}
			</h1>
			<p id="description" class="text-sm text-gray-600 line-clamp-5 mt-2">
				{{ description || 'Description not available' }}
			</p>
			<a class="text-primary underline hover:text-primary text-sm mt-2 line-clamp-1" :href="props.url"
				target="_blank">
				{{ props.url }}
			</a>
			<small class="text-xs font-semibold mt-2 text-gray-500">
				{{ new Date(props.timestamp).toLocaleString() }}
			</small>
		</div>
	</div>
</template>
