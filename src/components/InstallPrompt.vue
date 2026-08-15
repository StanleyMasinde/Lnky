<script setup lang="ts">
import {
	canInstall,
	dismissInstallPrompt,
	installApp,
	isIosClient,
	needsManualInstall,
	showInstallPrompt,
} from '@/pwa/register'
</script>

<template>
	<div v-if="showInstallPrompt"
		class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center"
		role="dialog" aria-modal="true" aria-labelledby="install-title" data-cy="install-prompt">
		<div
			class="w-full max-w-md rounded-xl border border-neutral-300 bg-white p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
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

			<div class="mt-5 flex gap-2">
				<button type="button"
					class="flex-1 rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-800 dark:bg-neutral-700 dark:text-white"
					@click="dismissInstallPrompt">
					Not now
				</button>
				<button v-if="!isIosClient" type="button" data-cy="install-button"
					class="flex-1 rounded-lg bg-primary px-4 py-3 font-semibold text-white"
					@click="installApp">
					{{ canInstall ? 'Install' : 'How to install' }}
				</button>
				<button v-else type="button"
					class="flex-1 rounded-lg bg-primary px-4 py-3 font-semibold text-white"
					@click="dismissInstallPrompt">
					Got it
				</button>
			</div>
		</div>
	</div>
</template>
