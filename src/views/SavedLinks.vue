<script setup lang="ts">
import type { Ref } from 'vue'
import { ref, onMounted } from 'vue'

interface SavedLink {
	id: IDBValidKey
	url: { url: string }
}

const savedLinks: Ref<SavedLink[]> = ref([])

onMounted(() => {
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
				savedLinks.value = [...savedLinks.value, { id: cursor.key, url: cursor.value }]
				cursor.continue()
			}
		}

		cursorRequest.onerror = () => console.error('Error opening cursor')
	}

	request.onerror = () => console.error('Error opening IndexedDB')
})
</script>

<template>
	<main class="grid grid-cols-12 grid-rows-1 place-items-center h-screen mx-2">
		<div class="col-span-12 w-full md:min-w-[75vw]">
			<div class="border-2 border-primary rounded-lg p-5">
				<div class="flex justify-center mb-2 w-full">
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
					<div v-for="(link, index) in savedLinks" class="border rounded-lg p-2 m-4 overflow-x-auto"
						:key="index">
						<div>
							<p>{{ link.url.url }}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>
</template>
