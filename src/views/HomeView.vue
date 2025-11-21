<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from 'vue'
import { useCleanLink } from '../composables/cleanLink'
import { useRoute } from 'vue-router'
import { useIsLoading } from '@/composables/state'

const $route = useRoute()
let sharedLink = null
const sharedTitle = $route.query.title as string
const sharedText = $route.query.text as string
const sharedUrl = $route.query.url as string

if (URL.canParse(sharedTitle)) {
	sharedLink = new URL(sharedTitle)
}

if (URL.canParse(sharedText)) {
	sharedLink = new URL(sharedText)
}

if (URL.canParse(sharedUrl)) {
	sharedLink = new URL(sharedUrl)
}

const sanitizedLink: Ref<string | undefined> = ref()
const currentLink: Ref<string | undefined> = ref()
const popoverElement = ref<HTMLDivElement>()

if (sharedLink) {
	currentLink.value = sharedLink.toString()
}

// Listen to changes on the
const cleanLink = async () => {
	if (!currentLink.value) return // Ensure the input link is not null or undefined
	const cleanedLink = await useCleanLink(currentLink.value)

	// Set the cleaned URL
	sanitizedLink.value = cleanedLink.toString()

	// Save the link in the local database
	saveLinkInDb(sanitizedLink.value)
}

const share = async () => {
	if (navigator.share && sanitizedLink.value) {
		// Save the link in the local database
		saveLinkInDb(sanitizedLink.value)

		// Share using the OS share option.
		// More ways may be added in future
		await navigator.share({
			url: sanitizedLink.value,
		})
	}
}

// Copy to to clipboard
const copyToClipBoard = async () => {
	if (sanitizedLink.value) {
		await navigator.clipboard.writeText(sanitizedLink.value)
		popoverElement.value?.showPopover()

		setTimeout(() => popoverElement.value?.hidePopover(), 5000)
	}
}

const saveLinkInDb = (link: string) => {
	const request = indexedDB.open('linksDb', 2)

	request.onupgradeneeded = (event) => {
		const database = (event.target as IDBOpenDBRequest).result
		if (!database.objectStoreNames.contains('links')) {
			const objectStore = database.createObjectStore('links', { autoIncrement: true })
			objectStore.createIndex('url', 'url', { unique: true })
			objectStore.createIndex('createdAt', 'createdAt')
		}
	}

	request.onsuccess = (event) => {
		const database = (event.target as IDBOpenDBRequest).result

		// Open a transaction to write data
		const transaction = database.transaction('links', 'readwrite')
		const objectStore = transaction.objectStore('links')

		const newLink = {
			url: link,
			createdAt: new Date().toISOString(),
		}

		objectStore.add(newLink)
	}
}

</script>

<template>
  <main class="min-h-[70vh] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

      <!-- Left: Hero / Input -->
      <section class="space-y-6">
        <h1 class="text-4xl md:text-5xl font-extrabold leading-tight">Privacy-first link cleaner</h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">Paste any URL and remove tracking parameters instantly. Save or share cleaned links with one click.</p>

        <form @submit.prevent="cleanLink()" @reset="currentLink = undefined; sanitizedLink = undefined" class="w-full">
          <div class="flex flex-col sm:flex-row gap-3">
            <input id="linkInput" data-cy="url-input" type="url" v-model="currentLink" autocomplete="off"
              placeholder="Paste a URL to clean (e.g. https://example.com/?utm_source=twitter)"
              class="flex-1 px-4 py-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />

            <button :disabled="!currentLink" data-cy="clean-button" type="submit"
              class="px-6 py-4 rounded-lg bg-primary text-white font-semibold disabled:opacity-60">
              {{ useIsLoading().value ? 'Please wait' : 'Remove Trackers' }}
            </button>
          </div>

          <div class="mt-3 flex gap-3">
              <button type="button" @click.prevent="copyToClipBoard()" :disabled="!sanitizedLink"
                class="btn btn-ghost px-4 py-2 rounded-md">Copy</button>
              <button type="button" @click.prevent="share" :disabled="!sanitizedLink"
                class="btn btn-primary px-4 py-2 rounded-md">Share</button>
              <button type="reset" class="btn btn-secondary px-4 py-2 rounded-md">Reset</button>
          </div>
        </form>

        <div class="mt-4">
          <label class="block mb-2 text-sm font-medium">Cleaned Link</label>
          <div class="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 bg-gray-50 dark:bg-neutral-900">
            <a v-if="sanitizedLink" :href="sanitizedLink" target="_blank" class="text-primary break-all">{{ sanitizedLink }}</a>
            <div v-else class="text-sm text-gray-500">Cleaned link will appear here after removing trackers.</div>
          </div>
        </div>
      </section>

      <!-- Right: Preview / Saved CTA -->
      <aside class="space-y-6">
        <div class="p-6 rounded-xl shadow-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <h3 class="font-semibold text-lg mb-2">Preview</h3>
          <div v-if="sanitizedLink">
            <LinkPreview :url="sanitizedLink" :timestamp="new Date().toISOString()" />
            <div class="mt-4 flex gap-3">
            <button @click.prevent="saveLinkInDb(sanitizedLink)" class="btn btn-primary px-4 py-2 rounded-lg">Save</button>
            <button @click.prevent="share" class="btn btn-secondary px-4 py-2 rounded-lg">Share</button>
            </div>
          </div>
          <div v-else class="text-gray-500">Paste a link to see a preview and quick actions.</div>
        </div>

        <div class="p-6 rounded-xl bg-linear-to-br from-primary/10 to-transparent border border-dashed border-primary/20 text-sm">
          <h4 class="font-semibold">Why use Lnky?</h4>
          <ul class="mt-2 list-disc list-inside text-gray-600 dark:text-gray-300">
            <li>Removes tracking params from URLs</li>
            <li>Save cleaned links locally</li>
            <li>Share using native OS share</li>
          </ul>
        </div>
      </aside>

    </div>

    <!-- Popover Notification -->
    <div popover id="my-popover" ref="popoverElement"
      class="bg-black text-white py-2 px-4 shadow-lg rounded-lg fixed top-6 left-1/2 transform -translate-x-1/2 w-fit max-w-xs text-center font-semibold transition-opacity duration-300 ease-in-out dark:bg-neutral-800 dark:border dark:border-neutral-700">
      Text copied to clipboard
    </div>
  </main>
</template>
