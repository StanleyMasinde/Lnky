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
}

const share = async () => {
	if (navigator.share && sanitizedLink.value) {
		// Save the link in the local database
		await saveLinkInDb(sanitizedLink.value)

		// Share using the OS share option.
		// More ways may be added in future
		await navigator.share({
			url: sanitizedLink.value,
		})
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
	<main class="grid grid-cols-12 grid-rows-2 place-items-center h-screen">
		<div class="col-span-12">
			<div class="border-2 border-primary rounded-lg p-5">
				<h1 class="font-medium text-lg">Welcome to Lnky</h1>
				<div>
					<form @submit.prevent="cleanLink()">
						<div class="flex flex-col gap-4">
							<div>
								<label for="linkInput">Paste the link below</label>
								<input v-model="currentLink" class="w-full rounded-lg" type="url" id="linkInput"
									placeholder="Paste the URL here" />
							</div>

							<div>
								<button class="bg-primary text-white rounded-lg w-full p-2" id="cleanButton">
									Clean link
								</button>
							</div>
						</div>
					</form>

					<hr>

					<div class="flex flex-col gap-2 mt-5">
						<textarea id="cleanedOutput" :value="sanitizedLink" readonly
							class="w-full rounded-lg"></textarea>
						<button @click.prevent="share" class="border px-4 bg-primary rounded-lg text-white py-2">
							Share
						</button>
					</div>
				</div>
			</div>
		</div>
	</main>
</template>
