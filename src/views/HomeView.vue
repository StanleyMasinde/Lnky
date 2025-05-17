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
	<main class="grid grid-cols-12 grid-rows-1 mx-2 md:mx-48">
		<div class="col-span-12">
			<div
				class="border border-neutral-300 dark:border-neutral-700 rounded-lg p-6 shadow-lg bg-white dark:bg-neutral-900">
				<!-- Navigation -->
				<div
					class="flex justify-center gap-2 mb-4 sticky top-0 bg-white dark:bg-neutral-900 p-3 rounded-md shadow-sm">
					<RouterLink data-cy="home-link" active-class="bg-primary text-white" to="/"
						class="w-full text-center p-2 rounded-lg font-semibold text-sm transition duration-200 hover:bg-primary hover:text-white">
						Home
					</RouterLink>
					<RouterLink data-cy="saved-links-link" to="/saved-links" active-class="bg-primary text-white"
						class="w-full text-center p-2 rounded-lg font-semibold text-sm transition duration-200 hover:bg-primary hover:text-white">
						Saved Links
					</RouterLink>
				</div>

				<!-- Main Section -->
				<h1 class="font-bold text-2xl mb-4 text-center">Welcome to Lnky</h1>
				<div class="space-y-5">
					<form @submit.prevent="cleanLink()" @reset="currentLink = undefined; sanitizedLink = undefined">
						<div class="space-y-4">
							<div>
								<label for="linkInput" class="block font-semibold mb-1">Paste the link below</label>
								<input data-cy="url-input" autocomplete="off" v-model="currentLink"
									class="w-full rounded-lg dark:bg-neutral-800 dark:text-white focus:ring-primary focus:border-primary px-4 py-3 border border-neutral-300 dark:border-neutral-700 transition duration-200"
									type="url" id="linkInput" placeholder="Paste the URL here" />
							</div>

							<div class="flex gap-2">
								<button :disabled="!currentLink" data-cy="clean-button"
									class="bg-primary text-white rounded-lg w-full p-3 cursor-pointer disabled:cursor-not-allowed disabled:bg-primary/50 transition duration-200 font-semibold">
									{{ useIsLoading().value ? "Please wait" : "Remove Trackers" }}
								</button>
								<button
									class="w-full bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-white rounded-lg p-3 font-semibold transition duration-200 hover:bg-gray-300 dark:hover:bg-neutral-600"
									type="reset">
									Reset
								</button>
							</div>
						</div>
					</form>

					<hr class="my-4 border-neutral-300 dark:border-neutral-700">

					<div class="space-y-4">
						<textarea placeholder="Cleaned link will appear here" data-cy="cleaned-url" id="cleanedOutput"
							:value="sanitizedLink" readonly
							class="w-full rounded-lg dark:bg-neutral-800 dark:text-white px-4 py-3 border border-neutral-300 dark:border-neutral-700 focus:border-primary focus:ring-primary transition duration-200"></textarea>

						<div class="flex gap-2">
							<button :disabled="!sanitizedLink" data-cy="share-button" @click.prevent="share"
								class="flex-1 px-4 py-3 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90 transition duration-200 disabled:bg-primary/50">
								Share
							</button>
							<button :disabled="!sanitizedLink" @click.prevent="copyToClipBoard()"
								class="flex-1 px-4 py-3 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90 transition duration-200 disabled:bg-primary/50">
								Copy to Clipboard
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Popover Notification -->
		<div popover id="my-popover" ref="popoverElement"
			class="bg-black text-white py-2 px-4 shadow-lg rounded-lg fixed top-4 left-1/2 transform -translate-x-1/2 w-fit max-w-xs text-center font-semibold transition-opacity duration-300 ease-in-out dark:bg-neutral-800 dark:border dark:border-neutral-700">
			Text copied to clipboard
		</div>
	</main>
</template>
