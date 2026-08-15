<script setup lang="ts">
import { nextTick, ref, watchEffect } from 'vue'
import {
	getOEmbedConfig,
	stripScripts,
	type OEmbedProvider,
	type OEmbedResponse,
} from '@/composables/oembed'

const PROXY_ORIGIN = 'https://lnky.api.stanleymasinde.com'

const props = defineProps<{ url: string, timestamp: string }>()
const title = ref<string | undefined>()
const image = ref<string | undefined>()
const description = ref<string | undefined>()
const embedHtml = ref<string | undefined>()
const embedProvider = ref<OEmbedProvider | undefined>()
const video = ref<string | undefined>()

const proxyUrlFor = (target: string) => {
	const proxyUrl = new URL(PROXY_ORIGIN)
	proxyUrl.pathname = 'proxy'
	proxyUrl.searchParams.set('url', target)
	return proxyUrl
}

const loadWidgetScript = (src: string) => {
	const existing = document.querySelector(`script[src="${src}"]`)
	if (existing) {
		const twitter = (window as unknown as { twttr?: { widgets?: { load?: () => void } } }).twttr
		twitter?.widgets?.load?.()
		return
	}

	const script = document.createElement('script')
	script.src = src
	script.async = true
	document.body.appendChild(script)
}

const applyOEmbed = async (data: OEmbedResponse, provider: OEmbedProvider, scriptSrc?: string) => {
	embedProvider.value = provider
	title.value = data.title
	image.value = data.thumbnail_url

	if (provider === 'youtube') {
		description.value = data.author_name
		return Boolean(data.title || data.thumbnail_url)
	}

	if (!data.html) return false

	embedHtml.value = stripScripts(data.html)

	if (scriptSrc) {
		await nextTick()
		loadWidgetScript(scriptSrc)
	}

	return true
}

const applyOpenGraph = (htmlRes: string, skipVideo = false) => {
	const parsed = new DOMParser().parseFromString(htmlRes, 'text/html')

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

	if (skipVideo) return

	video.value = parsed
		.querySelector(
			'meta[property="og:video"], meta[name="twitter:player"], meta[itemprop="video"]',
		)
		?.getAttribute('content') || undefined
}

const resetPreview = () => {
	title.value = undefined
	image.value = undefined
	description.value = undefined
	embedHtml.value = undefined
	embedProvider.value = undefined
	video.value = undefined
}

watchEffect(async () => {
	if (!props.url) return

	resetPreview()

	const oembed = getOEmbedConfig(props.url)
	if (oembed) {
		try {
			const res = await fetch(proxyUrlFor(oembed.endpoint), { mode: 'cors' })
			if (res.ok) {
				const embedRes = (await res.json()) as OEmbedResponse
				if (await applyOEmbed(embedRes, oembed.provider, oembed.scriptSrc)) {
					return
				}
			}
		}
		catch {
			// Fall through to Open Graph scraping.
		}
	}

	const res = await fetch(proxyUrlFor(props.url), { mode: 'cors' })
	applyOpenGraph(await res.text(), oembed?.provider === 'youtube')
})
</script>

<template>
	<!-- Twitter / Reddit rich oEmbed -->
	<div v-if="embedHtml"
		class="p-4 rounded-lg shadow-md dark:bg-neutral-900 max-w-150 w-full overflow-x-auto mx-auto"
		:style="embedProvider === 'twitter' ? 'min-width: 320px;' : undefined">
		<div v-html="embedHtml" class="prose dark:prose-invert" data-cy="rich-embed"
			:style="embedProvider === 'twitter' ? 'min-width: 550px;' : undefined"></div>

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

	<!-- OG Metadata Preview -->
	<div v-else
		class="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 p-4 border rounded-lg w-full overflow-hidden">
		<div v-if="image" class="w-full md:w-[40%] shrink-0">
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
