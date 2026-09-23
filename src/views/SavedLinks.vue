<script setup lang="ts">
import LinkPreview from '@/components/LinkPreview.vue'
import { openLinksDb, saveCleanedLink } from '@/composables/db'
import { isShareDismissal } from '@/composables/share'
import type { Ref } from 'vue'
import { ref, onMounted } from 'vue'

interface SavedLink {
	// eslint-disable-next-line no-undef
	id: IDBValidKey
	link: { url: string, createdAt: string }
}

const savedLinks: Ref<SavedLink[]> = ref([])
const undoneLink: Ref<SavedLink | undefined> = ref()
let undoTimer: ReturnType<typeof setTimeout> | undefined

// Delete immediately, offer Undo. Deletion is reversible; no confirm dialog.
const deleteLink = (link: SavedLink) => {
	void openLinksDb().then((db) => {
		const transaction = db.transaction('links', 'readwrite')
		const objectStore = transaction.objectStore('links')

		const deleteOperation = objectStore.delete(link.id)
		deleteOperation.onsuccess = () => {
			undoneLink.value = link
			fetchSavedNotes()
			if (undoTimer) clearTimeout(undoTimer)
			undoTimer = setTimeout(() => {
				undoneLink.value = undefined
			}, 8000)
		}
	})
}

const undoDelete = () => {
	const link = undoneLink.value
	if (!link) return
	undoneLink.value = undefined
	if (undoTimer) clearTimeout(undoTimer)
	void saveCleanedLink(link.link.url).then(() => fetchSavedNotes())
}

// Share a given link
const shareLink = async (url: string) => {
	if (!navigator.canShare({ url })) return
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
					id: keys[i],
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
	<!-- Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app -->
	<main class="mx-auto w-full max-w-2xl px-5 pb-10 pt-8 md:pt-12">
		<div class="flex items-baseline justify-between gap-4">
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
			<div v-if="savedLinks.length === 0" class="border-t border-solid border-rule pt-8">
				<p class="font-semibold">No saved links yet.</p>
				<p class="mt-1 text-ink-2">Cleaned links are kept here so you can find them offline.</p>
				<RouterLink to="/" class="mt-4 inline-block font-semibold text-accent underline underline-offset-4 hover:text-ink">
					Clean a link
				</RouterLink>
			</div>

			<TransitionGroup v-else name="hl-row" tag="ul" class="border-t border-solid border-rule">
				<li v-for="link in savedLinks" :key="link.link.url"
					class="border-b border-solid border-rule py-5">
					<LinkPreview :url="link.link.url" :timestamp="link.link.createdAt" />

					<div class="mt-3 flex items-center justify-end gap-2">
						<button @click.prevent="shareLink(link.link.url)"
							class="hl-btn hl-lift whitespace-nowrap rounded-[10px] border border-solid border-rule px-5 font-semibold text-ink hover:bg-paper-2">
							Share
						</button>
						<button @click.prevent="deleteLink(link)"
							class="hl-btn hl-lift whitespace-nowrap rounded-[10px] px-4 font-semibold text-error hover:bg-paper-2">
							Delete
						</button>
					</div>
				</li>
			</TransitionGroup>
		</div>

		<div v-if="undoneLink" role="status"
			class="hl-toast fixed inset-x-5 bottom-5 z-toast mx-auto flex max-w-md items-center justify-between gap-4 rounded-[10px] border border-solid border-rule bg-ink px-4 py-3 text-sm text-paper">
			<p class="min-w-0 flex-1 truncate font-mono text-xs">{{ undoneLink.link.url }}</p>
			<button @click.prevent="undoDelete"
				class="hl-btn shrink-0 whitespace-nowrap rounded-lg px-3 font-semibold text-paper underline underline-offset-4">
				Undo
			</button>
		</div>
	</main>
</template>
