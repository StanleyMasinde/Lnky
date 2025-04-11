<script setup lang="ts">
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
			<div class="rounded-lg p-5">
				<div class="flex justify-center mb-2 w-full sticky top-0 bg-white dark:bg-neutral-900 p-2">
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

					<TransitionGroup name="list" tag="div" v-else>
						<div v-for="(link, index) in savedLinks" class="border rounded-lg p-2 m-4" :key="index">
							<div class="line-clamp-1">
								<a class="text-lg underline hover:text-primary" :href="link.link.url" target="_blank">{{
									link.link.url }}</a>
							</div>

							<div>
								<small class="text-xs font-semibold">{{ new Date(link.link.createdAt) }}</small>
							</div>

							<hr class="my-2">

							<!-- Actions -->
							<div class="flex flex-col gap-1 mt-2">
								<button @click.prevent="shareLink(link.link.url)"
									class="bg-primary text-white py-1 rounded-lg">
									Share
								</button>

								<button @click.prevent="confirmDelete(link)"
									class="bg-red-500 text-white  rounded-lg py-1">
									Delete
								</button>
							</div>
						</div>
					</TransitionGroup>
				</div>
			</div>
		</div>

		<!-- dialog for the delete confirmation -->
		<dialog popover ref="deleteRef" class="rounded-lg shadow-lg p-2 md:max-w-9/10 mx-auto my-auto">
			<div>
				<h3 class="text-lg font-semibold">Are you sure ?</h3>
				<p class="text-sm text-gray-600">This link will be lost forever</p>
				<p class="line-clamp-1 text-sm">{{ currentToDelete?.link.url }}</p>

				<hr>

				<div class="mt-4 flex justify-end gap-2">
					<button @click.prevent="deleteRef?.close()" class="px-4 py-2 bg-gray-200 rounded-lg">
						No, Don't delete
					</button>

					<button @click.prevent="deleteLink()" class="px-4 py-2 bg-red-600 text-white rounded-lg">
						Yes, delete
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
