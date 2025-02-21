<script setup lang="ts">
import type { Ref } from 'vue'
import { ref, onMounted } from 'vue'

interface SavedLink {
	id: IDBValidKey
	link: { url: string, createdAt: string }
}

const savedLinks: Ref<SavedLink[]> = ref([])

// Delete Link
const deleteLink = (id: IDBValidKey) => {
	const openDbRequest = indexedDB.open('linksDb', 1)

	openDbRequest.onsuccess = (event) => {
		const db = (event.target as IDBOpenDBRequest)?.result as IDBDatabase

		const transaction = db.transaction('links', 'readwrite')
		const objectStore = transaction.objectStore('links')

		const deleteOperation = objectStore.delete(id)
		deleteOperation.onsuccess = (ev) => {
			console.log(ev)
			fetchSavedNotes()
		}
	}
}

// Get all the saved link
const fetchSavedNotes = () => {
	savedLinks.value = []
	const request = indexedDB.open('linksDb', 1)

	request.onsuccess = (event) => {
		const db = (event.target as IDBOpenDBRequest)?.result as IDBDatabase

		// Open a transaction before accessing object store
		const transaction = db.transaction('links', 'readonly')
		const objectStore = transaction.objectStore('links')

		const cursorRequest = objectStore.openCursor()

		cursorRequest.onsuccess = (event) => {
			const cursor: IDBCursorWithValue | null = (event.target as IDBRequest).result
			if (cursor) {
				savedLinks.value = [...savedLinks.value, { id: cursor.key, link: cursor.value }]
				cursor.continue()
			}
		}

		cursorRequest.onerror = () => console.error('Error opening cursor')
	}

	request.onerror = () => console.error('Error opening IndexedDB')
}

onMounted(() => {
	fetchSavedNotes()
})
</script>

<template>
	<main class="grid grid-cols-12 grid-rows-1 mx-1 md:mx-48">
		<div class="col-span-12 w-full">
			<div class="rounded-lg p-5">
				<div class="flex justify-center mb-2 w-full sticky top-0 bg-white p-2">
					<RouterLink data-cy="home-link" active-class="bg-primary text-white" to="/"
						class="w-full text-center p-2 rounded-lg">
						Home
					</RouterLink>

					<RouterLink data-cy="saved-links-link" to="/saved-links" active-class="bg-primary text-white"
						class="w-full text-center p-2 rounded-lg">
						Saved links
					</RouterLink>
				</div>
				<h1 class="font-medium text-lg">Saved links</h1>

				<!-- The list of links -->
				<div data-cy="saved-link-item ">

					<div class="text-center" v-if="savedLinks.length == 0">No links found!</div>

					<div v-else v-for="(link, index) in savedLinks" class="border rounded-lg p-2 m-4" :key="index">
						<div class="line-clamp-1">
							<p class="text-lg">{{ link.link.url }}</p>
						</div>

						<div>
							<small class="text-xs font-semibold">{{ new Date(link.link.createdAt) }}</small>
						</div>

						<!-- Actions -->
						<div class="flex flex-col mt-2">
							<button @click.prevent="deleteLink(link.id)"
								class="bg-red-500 text-white rounded-lg py-1">Delete</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>
</template>
