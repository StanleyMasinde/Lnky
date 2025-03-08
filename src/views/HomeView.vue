<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from 'vue'
import { useCleanLink } from '../composables/cleanLink'
import { useRoute } from 'vue-router'
import { useIsLoading } from '@/composables/state'

const $route = useRoute()
const sharedLink: string = $route.query.link as string

const sanitizedLink: Ref<string | undefined> = ref()
const currentLink: Ref<string | undefined> = ref()
const popoverElement = ref<HTMLDivElement>()

if (sharedLink) {
	currentLink.value = sharedLink.trim()
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
		try {
			await navigator.share({
				url: sanitizedLink.value,
			})
		}
		catch (err) {
			console.warn('This needs to be handled', err)
		}
	}
}

// Copy to to clipboard
const copyToClipBoard = async () => {
	if (sanitizedLink.value) {
		try {
			await navigator.clipboard.writeText(sanitizedLink.value)
			popoverElement.value?.showPopover()

			setTimeout(() => popoverElement.value?.hidePopover(), 5000)
		}
		catch (err) {
			console.log(err)
		}
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

		const addRequest = objectStore.add(newLink)

		addRequest.onsuccess = () => {
			console.log('Link saved successfully:', link)
		}

		addRequest.onerror = (error) => {
			console.error('Error saving link:', (error.target as IDBRequest).error)
		}
	}

	request.onerror = (event) => {
		console.error('Database error:', (event.target as IDBOpenDBRequest).error)
	}
}

</script>

<template>
	<main class="grid grid-cols-12 grid-rows-1  mx-2 md:mx-48">
		<div class="col-span-12">
			<div class="border-primary rounded-lg p-5">
				<div class="flex justify-center mb-2 sticky top-0 bg-white p-2">
					<RouterLink data-cy="home-link" active-class="bg-primary text-white" to="/"
						class="w-full text-center p-2 rounded-lg">
						Home
					</RouterLink>

					<RouterLink data-cy="saved-links-link" to="/saved-links" active-class="bg-primary text-white"
						class="w-full text-center p-2 rounded-lg">
						Saved links
					</RouterLink>
				</div>
				<h1 class="font-medium text-lg">Welcome to Lnky</h1>
				<div>
					<form @submit.prevent="cleanLink()" @reset="currentLink = undefined; sanitizedLink = undefined">
						<div class="flex flex-col gap-4">
							<div>
								<label for="linkInput">Paste the link below</label>
								<input data-cy="url-input" autocomplete="off" v-model="currentLink"
									class="w-full rounded-lg" type="url" id="linkInput"
									placeholder="Paste the URL here" />
							</div>

							<div class="flex gap-1">
								<button :disabled="!currentLink" data-cy="clean-button"
									class="bg-primary text-white rounded-lg w-full p-2 cursor-pointer disabled:cursor-not-allowed disabled:bg-primary/50"
									id="cleanButton">
									{{ useIsLoading().value ? "Please wait" : "Remove trackers" }}
								</button>
								<button class="w-full bg-secondary rounded-lg text-white" type="reset">Reset</button>
							</div>
						</div>
					</form>

					<hr>

					<div class="flex flex-col gap-2 mt-5">
						<textarea placeholder="Cleaned link will appear here" data-cy="cleaned-url" id="cleanedOutput"
							:value="sanitizedLink" readonly class="w-full rounded-lg"></textarea>

						<div class="grid grid-rows-1 grid-cols-1 md:grid-cols-2 gap-2">
							<button :disabled="!sanitizedLink" data-cy="share-button" @click.prevent="share"
								class="border px-4 bg-primary rounded-lg text-white py-2 cursor-pointer w-full disabled:cursor-not-allowed disabled:bg-primary/50">
								Share
							</button>

							<button :disabled="!sanitizedLink" @click.prevent="copyToClipBoard()"
								class="border px-4 bg-primary rounded-lg text-white py-2 cursor-pointer w-full disabled:cursor-not-allowed disabled:bg-primary/50">
								Copy to clipboard
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div popover id="my-popover" ref="popoverElement"
			class="bg-black/75 text-white border py-2 shadow rounded-lg fixed w-full text-center">Text copied to
			clipboard</div>
	</main>
</template>
