<script setup lang="ts">
import LinkPreview from '@/components/LinkPreview.vue'
import { openLinksDb } from '@/composables/db'
import { isShareDismissal } from '@/composables/share'
import type { Ref } from 'vue'
import { ref, onMounted, onUnmounted } from 'vue'

interface SavedLink {
	id: number
	link: { url: string, createdAt: string }
}

const savedLinks: Ref<SavedLink[]> = ref([])
const undoneLink: Ref<SavedLink | undefined> = ref()
let undoTimer: ReturnType<typeof setTimeout> | undefined

const deletionError = ref('')
const pendingDeletes = ref(new Set<SavedLink['id']>())
const leavingRows = ref(0)

// Update the rendered list only after the transaction commits.
const deleteLink = async (link: SavedLink) => {
	if (pendingDeletes.value.has(link.id)) return
	pendingDeletes.value.add(link.id)
	deletionError.value = ''
	try {
		const db = await openLinksDb()
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction('links', 'readwrite')
			transaction.objectStore('links').delete(link.id)
			transaction.oncomplete = () => resolve()
			transaction.onabort = () => reject(transaction.error)
			transaction.onerror = () => reject(transaction.error)
		})
		leavingRows.value++
		savedLinks.value = savedLinks.value.filter(saved => saved.id !== link.id)
		undoneLink.value = link
		if (undoTimer) clearTimeout(undoTimer)
		undoTimer = setTimeout(() => { undoneLink.value = undefined }, 8000)
	}
	catch {
		deletionError.value = 'Could not delete this link. Please try again.'
	}
	finally {
		pendingDeletes.value.delete(link.id)
	}
}

const undoDelete = async () => {
	const link = undoneLink.value
	if (!link) return
	if (undoTimer) clearTimeout(undoTimer)
	undoneLink.value = undefined
	try {
		const db = await openLinksDb()
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction('links', 'readwrite')
			transaction.objectStore('links').put({ ...link.link }, link.id)
			transaction.oncomplete = () => resolve()
			transaction.onabort = () => reject(transaction.error)
			transaction.onerror = () => reject(transaction.error)
		})
		deletionError.value = ''
		fetchSavedNotes()
	}
	catch {
		undoneLink.value = link
		deletionError.value = 'Could not restore this link. Try Undo again.'
	}
}

onUnmounted(() => {
	if (undoTimer) clearTimeout(undoTimer)
})

// Share a given link
const shareLink = async (url: string) => {
	if (!navigator.share || (navigator.canShare && !navigator.canShare({ url }))) return
	try {
		await navigator.share({
			url,
		})
	}
	catch (err) {
		if (isShareDismissal(err)) return
		throw err
	}
}

// Get all the saved link
const fetchSavedNotes = () => {
	void openLinksDb().then((db) => {
		const tx = db.transaction('links', 'readonly')
		const store = tx.objectStore('links')

		const getAllReq = store.getAll()
		const getAllKeysReq = store.getAllKeys()

		getAllReq.onsuccess = () => {
			const values = getAllReq.result
			getAllKeysReq.onsuccess = () => {
				const keys = getAllKeysReq.result
				savedLinks.value = values.map((val, i) => ({
					id: Number(keys[i]),
					link: val,
				})).reverse()
			}
		}
	})
}

onMounted(() => {
	fetchSavedNotes()
})
</script>

<template>
	<!-- Hallmark · genre: editorial · macrostructure: Split Workbench · design-system: design.md · designed-as-app -->
	<main class="app-main mx-auto w-full max-w-2xl px-5 pb-10 pt-8 md:pt-12">
		<div class="page-heading flex items-baseline justify-between gap-4">
			<h1 class="min-w-0 text-xl font-bold">Saved links.</h1>
			<nav aria-label="Primary" class="flex shrink-0 gap-5 text-sm font-semibold">
				<RouterLink data-cy="home-link" to="/" active-class="text-accent underline decoration-accent decoration-2 underline-offset-8"
					class="whitespace-nowrap text-ink-2 hover:text-ink">
					Clean
				</RouterLink>
				<RouterLink data-cy="saved-links-link" to="/saved-links" active-class="text-accent underline decoration-accent decoration-2 underline-offset-8"
					class="whitespace-nowrap text-ink-2 hover:text-ink">
					Saved
				</RouterLink>
			</nav>
		</div>
		<p class="hl-tabnum mt-2 font-mono text-sm text-ink-2">
			{{ savedLinks.length === 0 ? "Nothing saved yet" : `${savedLinks.length} saved` }} · kept on this device only
		</p>

		<div data-cy="saved-link-item" class="mt-6">
			<div v-if="savedLinks.length === 0 && leavingRows === 0" class="saved-empty border-t border-solid border-rule pt-8">
				<p class="font-semibold">No saved links yet.</p>
				<p class="mt-1 text-ink-2">Cleaned links are kept here so you can find them offline.</p>
				<RouterLink to="/" class="mt-4 inline-block font-semibold text-accent underline underline-offset-4 hover:text-ink">
					Clean a link
				</RouterLink>
			</div>

			<TransitionGroup name="hl-row" tag="ul" class="saved-list"
				@after-leave="leavingRows = Math.max(0, leavingRows - 1)"
				@leave-cancelled="leavingRows = Math.max(0, leavingRows - 1)">
				<li v-for="link in savedLinks" :key="link.id"
					class="border-b border-solid border-rule py-5">
					<LinkPreview :url="link.link.url" :timestamp="link.link.createdAt" />

					<div class="mt-3 flex items-center justify-end gap-2">
						<button @click.prevent="shareLink(link.link.url)"
							class="hl-btn hl-lift whitespace-nowrap rounded-none border border-solid border-rule px-5 font-semibold text-ink hover:bg-paper-2">
							Share
						</button>
						<button :disabled="pendingDeletes.has(link.id)" @click.prevent="deleteLink(link)"
							class="hl-btn hl-lift whitespace-nowrap rounded-none px-4 font-semibold text-error hover:bg-paper-2">
							Delete
						</button>
					</div>
				</li>
			</TransitionGroup>
		</div>

		<p v-if="deletionError" role="alert" class="saved-error">{{ deletionError }}</p>

		<div v-if="undoneLink" role="status"
			class="hl-toast fixed inset-x-5 bottom-5 z-toast mx-auto flex max-w-md items-center justify-between gap-4 rounded-none border border-solid border-rule bg-ink px-4 py-3 text-sm text-paper">
			<p class="min-w-0 flex-1 truncate font-mono text-xs">{{ undoneLink.link.url }}</p>
			<button @click.prevent="undoDelete"
				class="hl-btn shrink-0 whitespace-nowrap rounded-none px-3 font-semibold text-paper underline underline-offset-4">
				Undo
			</button>
		</div>
	</main>
</template>
