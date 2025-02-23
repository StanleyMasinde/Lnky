<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from 'vue'

const sanitizedLink: Ref<string | undefined> = ref()
const currentLink: Ref<string | undefined> = ref()
// Listen to changes on the
const cleanLink = () => {
	if (!currentLink.value) return // Ensure the input link is not null or undefined

	const regex = /[?&](utm_[^=]+|pk_[^=]+|fbclid|feature|si|t|src|ref|cmp|cmp_id|ref_source|ref_medium|ref_campaign|ref_content|ref_term|gclid|msclkid|yclid|igshid|li_fat_id|ttclid|sa|ust|ab_channel|source|sa=D|source=editors|ab|referral|ref_tag|referring_source|click_id|ad_id|tag|q)=([^&]+)/gi

	// Remove all matched query parameters from the link
	let cleanedLink = currentLink.value.replace(regex, '')

	// Clean up any trailing '?' or '&' at the end of the URL
	cleanedLink = cleanedLink.replace(/[?&]$/, '')

	// Set the cleaned URL
	sanitizedLink.value = cleanedLink

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

const saveLinkInDb = (link: string) => {
	const request = indexedDB.open('linksDb', 1)

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
					<form @submit.prevent="cleanLink()" @reset="currentLink = undefined;sanitizedLink = undefined">
						<div class="flex flex-col gap-4">
							<div>
								<label for="linkInput">Paste the link below</label>
								<input data-cy="url-input" v-model="currentLink" class="w-full rounded-lg" type="url"
									id="linkInput" placeholder="Paste the URL here" />
							</div>

							<div class="flex gap-1">
								<button :disabled="!currentLink" data-cy="clean-button"
									class="bg-primary text-white rounded-lg w-full p-2 cursor-pointer disabled:cursor-not-allowed disabled:bg-primary/50"
									id="cleanButton">
									Clean link
								</button>
								<button class="w-full bg-secondary rounded-lg text-white" type="reset">Reset</button>
							</div>
						</div>
					</form>

					<hr>

					<div class="flex flex-col gap-2 mt-5">
						<textarea data-cy="cleaned-url" id="cleanedOutput" :value="sanitizedLink" readonly
							class="w-full rounded-lg"></textarea>
						<button :disabled="!sanitizedLink" data-cy="share-button" @click.prevent="share"
							class="border px-4 bg-primary rounded-lg text-white py-2 cursor-pointer disabled:cursor-not-allowed disabled:bg-primary/50">
							Share
						</button>
					</div>
				</div>
			</div>
		</div>
	</main>
</template>
