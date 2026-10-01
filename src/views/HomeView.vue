<script setup lang="ts">
import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { useCleanLink } from '../composables/cleanLink'
import { saveCleanedLink } from '../composables/db'
import { isShareDismissal } from '../composables/share'
import { useRoute } from 'vue-router'
import { useIsLoading } from '@/composables/state'
import { extractSharedUrl } from '@/pwa/extractSharedUrl'

const $route = useRoute()

const sanitizedLink: Ref<string | undefined> = ref()
const currentLink: Ref<string | undefined> = ref()
const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

const cleanLink = async () => {
	if (!currentLink.value) return
	const cleanedLink = await useCleanLink(currentLink.value)

	sanitizedLink.value = cleanedLink.toString()
	void saveCleanedLink(sanitizedLink.value)
}

watch(() => $route.query, (query) => {
	const shared = extractSharedUrl(query)
	if (!shared) {
		return
	}

	currentLink.value = shared
	void cleanLink()
}, { immediate: true })

const share = async () => {
	if (navigator.share && sanitizedLink.value) {
		void saveCleanedLink(sanitizedLink.value)
		try {
			await navigator.share({
				url: sanitizedLink.value,
			})
		}
		catch (err) {
			if (isShareDismissal(err)) return
			throw err
		}
	}
}

// Copy to clipboard — the label swap IS the feedback. No toast.
const copyToClipBoard = async () => {
	if (!sanitizedLink.value) return
	await navigator.clipboard.writeText(sanitizedLink.value)
	copied.value = true
	if (copiedTimer) clearTimeout(copiedTimer)
	copiedTimer = setTimeout(() => {
		copied.value = false
	}, 2500)
}

const resetForm = () => {
	currentLink.value = undefined
	sanitizedLink.value = undefined
	copied.value = false
}

</script>

<template>
	<!-- Hallmark · genre: editorial · macrostructure: Split Workbench · design-system: design.md · designed-as-app -->
	<main class="app-main mx-auto w-full max-w-2xl px-5 pb-10 pt-8 md:pt-12">
		<div class="page-heading flex items-baseline justify-between gap-4">
			<h1 class="min-w-0 text-xl font-bold">Strip the trackers.</h1>
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
		<p class="mt-2 max-w-prose text-base leading-relaxed text-ink-2">
			Paste a link. Lnky removes the tracking parameters and keeps the clean
			copy on this device.
		</p>

		<div class="clean-workbench">
		<form @submit.prevent="cleanLink()" @reset="resetForm" class="mt-8">
			<label for="linkInput" class="block text-sm font-semibold">Paste link</label>
			<input data-cy="url-input" autocomplete="off" v-model="currentLink"
				class="hl-btn mt-2 w-full rounded-none border border-solid border-rule bg-paper px-4 text-base text-ink placeholder:text-ink-2 hover:bg-paper-2"
				type="url" id="linkInput" placeholder="https://example.com/?utm_source=…" />
			<p class="mt-2 min-h-lh text-sm text-ink-2">Trackers like <span class="font-mono text-sm">utm_source</span>, <span class="font-mono text-sm">fbclid</span> and <span class="font-mono text-sm">ref</span> are removed. Short links are expanded first.</p>

			<div class="mt-4 flex flex-col gap-2 sm:flex-row">
				<button :disabled="!currentLink" data-cy="clean-button" id="cleanButton"
					class="hl-btn hl-lift flex-1 cursor-pointer whitespace-nowrap rounded-none bg-accent px-4 font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-50">
					{{ useIsLoading().value ? "Cleaning…" : "Remove trackers" }}
				</button>
				<button
					class="hl-btn hl-lift flex-1 whitespace-nowrap rounded-none border border-solid border-rule px-4 font-semibold text-ink hover:bg-paper-2"
					type="reset">
					Reset
				</button>
			</div>
		</form>

		<section aria-label="Cleaned link" class="mt-8 border-t border-solid border-rule pt-6">
			<label for="cleanedOutput" class="block text-sm font-semibold">Clean link</label>
			<textarea placeholder="The cleaned link appears here" data-cy="cleaned-url" id="cleanedOutput"
				:value="sanitizedLink" readonly rows="2"
				class="mt-2 w-full resize-y rounded-none border border-solid border-rule bg-paper px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-2 hover:bg-paper-2"></textarea>

			<div class="mt-4 flex flex-col gap-2 sm:flex-row">
				<button :disabled="!sanitizedLink" @click.prevent="copyToClipBoard()" data-cy="copy-button"
					class="hl-btn hl-lift flex-1 whitespace-nowrap rounded-none bg-accent px-4 font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-50">
					{{ copied ? "✓ Copied" : "Copy link" }}
				</button>
				<button :disabled="!sanitizedLink" data-cy="share-button" @click.prevent="share"
					class="hl-btn hl-lift flex-1 whitespace-nowrap rounded-none border border-solid border-rule px-4 font-semibold text-ink hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-50">
					Share
				</button>
			</div>
		</section>
		</div>
	</main>
</template>
