<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import {
	canInstall,
	dismissInstallPrompt,
	installApp,
	isIosClient,
	needsManualInstall,
	showInstallPrompt,
} from '@/pwa/register'

const dialogEl = ref<HTMLDialogElement>()

const syncDialog = async (open: boolean) => {
	await nextTick()
	const dialog = dialogEl.value
	if (!dialog) {
		return
	}

	if (open && !dialog.open) {
		dialog.showModal?.()
		return
	}

	if (!open && dialog.open) {
		dialog.close?.()
	}
}

const onClose = () => {
	if (showInstallPrompt.value) {
		dismissInstallPrompt()
	}
}

watch(showInstallPrompt, (open) => {
	void syncDialog(open)
})

onMounted(() => {
	void syncDialog(showInstallPrompt.value)
})
</script>

<template>
	<dialog ref="dialogEl" data-cy="install-prompt" closedby="any" aria-labelledby="install-title"
		class="install-dialog m-auto w-[calc(100%-1.5rem)] max-w-md"
		@close="onClose">
		<h2 id="install-title" class="text-xl font-bold">Install Lnky</h2>
		<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
			Add it to your home screen. Then share a link from any app and Lnky can strip the trackers.
		</p>

		<ol v-if="isIosClient" class="mt-4 list-decimal space-y-1 pl-5 text-sm">
			<li>Tap the Share button in Safari</li>
			<li>Tap <strong>Add to Home Screen</strong></li>
			<li>Open Lnky from the home screen next time</li>
		</ol>

		<p v-else-if="needsManualInstall" class="mt-4 text-sm text-gray-600 dark:text-gray-300">
			Open the browser menu and choose <strong>Install app</strong> or <strong>Add to Home Screen</strong>.
		</p>

		<form method="dialog" class="mt-5 flex gap-2">
			<button type="submit" value="dismiss"
				class="hl-btn hl-lift flex-1 bg-paper-2 px-4 py-3 font-semibold text-ink">
				{{ isIosClient ? 'Got it' : 'Not now' }}
			</button>
			<button v-if="!isIosClient" type="button" data-cy="install-button"
				class="hl-btn hl-lift flex-1 bg-accent px-4 py-3 font-semibold text-accent-ink"
				@click="installApp">
				{{ canInstall ? 'Install' : 'How to install' }}
			</button>
		</form>
	</dialog>
</template>
