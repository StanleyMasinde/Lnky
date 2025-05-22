<script setup lang="ts">
import LinkPreview from '@/components/LinkPreview.vue'
import type { Ref } from 'vue'
import { ref, onMounted } from 'vue'

interface SavedLink {
	// eslint-disable-next-line no-undef
	id: IDBValidKey
	link: { url: string, createdAt: string }
}

const savedLinks: Ref<SavedLink[]> = ref([])
const deleteRef = ref<HTMLDialogElement>()
const currentToDelete = ref<SavedLink>()

const confirmDelete = (link: SavedLink) => {
	currentToDelete.value = link
	deleteRef.value?.showModal()
}

// Delete Link
const deleteLink = () => {
	const itemId = currentToDelete.value?.id

	if (!itemId) {
		return
	}
	const openDbRequest = indexedDB.open('linksDb', 2)

	openDbRequest.onsuccess = (event) => {
		const db = (event.target as IDBOpenDBRequest)?.result as IDBDatabase

		const transaction = db.transaction('links', 'readwrite')
		const objectStore = transaction.objectStore('links')

		const deleteOperation = objectStore.delete(itemId)
		deleteOperation.onsuccess = () => {
			fetchSavedNotes()
			deleteRef.value?.close()
		}
	}
}

// Get all the saved link
const fetchSavedNotes = () => {
	savedLinks.value = []
	const request = indexedDB.open('linksDb', 2)

	request.onsuccess = (event) => {
		const db = (event.target as IDBOpenDBRequest)?.result as IDBDatabase

		// Open a transaction before accessing object store
		const transaction = db.transaction('links', 'readonly')
		const objectStore = transaction.objectStore('links')

		const cursorRequest = objectStore.openCursor()

		cursorRequest.onsuccess = (event) => {
			const cursor: IDBCursorWithValue | null = (event.target as IDBRequest).result
			if (cursor) {
				savedLinks.value.unshift({ id: cursor.key, link: cursor.value })
				cursor.continue()
			}
		}
	}
}

// Share a given link
const shareLink = (url: string) => {
	if (navigator.canShare({ url })) {
		navigator.share({
			url,
		})
	}
}

onMounted(() => {
	fetchSavedNotes()
})
</script>

<template>
	<main class="grid grid-cols-12 grid-rows-1 mx-1 md:mx-48">
		<div class="col-span-12 w-full">
			<div
				class="border border-neutral-300 dark:border-neutral-700 rounded-lg p-6 shadow-lg bg-white dark:bg-neutral-900">

				<!-- Heading -->
				<h1 class="font-bold text-2xl mb-6 text-center text-gray-800 dark:text-gray-200">Saved Links</h1>

				<!-- Link List -->
				<div data-cy="saved-link-item">
					<div v-if="savedLinks.length === 0"
						class="text-center text-gray-500 dark:text-gray-400 py-10 text-lg font-medium">
						No links found!
					</div>

					<TransitionGroup name="list" tag="div" v-else class="space-y-6">
						<div v-for="link in savedLinks" :key="link.link.url"
							class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 shadow-sm bg-gray-50 dark:bg-neutral-800 transition duration-200 hover:shadow-md">
							<LinkPreview :url="link.link.url" :timestamp="link.link.createdAt" />

							<hr class="my-4 border-neutral-300 dark:border-neutral-700">

							<!-- Actions -->
							<div class="flex flex-wrap gap-3 justify-center md:justify-end">
								<button @click.prevent="shareLink(link.link.url)"
									class="bg-primary text-white py-2 px-5 rounded-lg font-semibold transition duration-200 hover:bg-primary/90">
									Share
								</button>
								<button @click.prevent="confirmDelete(link)"
									class="bg-red-600 text-white py-2 px-5 rounded-lg font-semibold transition duration-200 hover:bg-red-700">
									Delete
								</button>
							</div>
						</div>
					</TransitionGroup>
				</div>
			</div>
		</div>

		<!-- Delete Confirmation Dialog -->
		<dialog popover ref="deleteRef"
			class="rounded-xl shadow-2xl p-6 max-w-md w-full mx-auto my-auto dark:bg-neutral-900 dark:text-white transition duration-300 ease-in-out transform">
			<div class="flex flex-col space-y-5">
				<h3 class="text-xl font-bold text-center text-red-600">Confirm Deletion</h3>
				<p class="text-sm text-center text-gray-600 dark:text-gray-400">
					This link will be lost forever. Are you sure?
				</p>
				<p class="line-clamp-1 text-sm text-center font-mono text-primary dark:text-primary">
					{{ currentToDelete?.link.url }}
				</p>

				<hr class="border-gray-300 dark:border-gray-700 my-3">

				<div class="flex justify-end gap-4">
					<button @click.prevent="deleteRef?.close()"
						class="px-5 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 dark:text-white text-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200">
						Cancel
					</button>
					<button @click.prevent="deleteLink()"
						class="px-5 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition duration-200">
						Yes, Delete
					</button>
				</div>
			</div>
		</dialog>
	</main>
</template>

<style lang="css">
.list-enter-active,
.list-leave-active {
	transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
	opacity: 0;
	transform: translateX(30px);
}
</style>
