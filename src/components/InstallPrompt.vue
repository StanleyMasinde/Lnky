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
		class="m-auto w-[calc(100%-1.5rem)] max-w-md rounded-xl border border-neutral-300 bg-white p-5 text-inherit shadow-2xl backdrop:bg-black/50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
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
				class="flex-1 rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-800 dark:bg-neutral-700 dark:text-white">
				{{ isIosClient ? 'Got it' : 'Not now' }}
			</button>
			<button v-if="!isIosClient" type="button" data-cy="install-button"
				class="flex-1 rounded-lg bg-primary px-4 py-3 font-semibold text-white"
				@click="installApp">
				{{ canInstall ? 'Install' : 'How to install' }}
			</button>
		</form>
	</dialog>
</template>
