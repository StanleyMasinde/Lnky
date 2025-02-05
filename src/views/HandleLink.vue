<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const $route = useRoute()
const sharedLink: string = $route.query.link as string
const sharedText: string = $route.query.text as string
const sanitizedLink = computed(() => {
	let currentLink = ''
	if (sharedLink) {
		currentLink = sharedLink
	}
	else if (sharedText) {
		currentLink = sharedText
	}
	else {
		return
	}
	const regex
    = /[?&](utm_[^=]+|pk_[^=]+|fbclid|feature|si|t|src|ref|cmp|cmp_id|ref_source|ref_medium|ref_campaign|ref_content|ref_term|gclid|msclkid|yclid)=([^&]+)/gi
	const cleanLink = currentLink?.replace(regex, '')
	return cleanLink?.replace(/[?&]$/, '')
})
const share = async () => {
	if (navigator.share) {
		await navigator.share({
			url: sanitizedLink.value,
		})
	}
}
</script>

<template>
  <main v-if="sanitizedLink" class="flex flex-col justify-end h-screen bg-gray-300">
    <div class="col-span-10 mb-8"></div>
    <div class="flex flex-col gap-2 mx-3">
      <textarea :value="sanitizedLink" readonly class="w-full rounded-lg"></textarea>
      <button @click.prevent="share" class="border px-4 bg-primary rounded-lg text-white py-2">
        Share
      </button>
    </div>
  </main>
  <main v-else class="text-center">
    <h1 class="font-bold text-3xl">No valid link found</h1>
  </main>
</template>
