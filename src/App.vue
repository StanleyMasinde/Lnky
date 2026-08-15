<script setup lang="ts">
import { RouterView } from 'vue-router'
import { applyUpdate, canInstall, dismissIosInstallHint, installApp, showIosInstallHint, updateAvailable } from './pwa/register'

const version = __APP_VERSION__
</script>

<template>
	<header></header>

	<RouterView v-slot="{ Component }">
		<Transition enter-from-class="translate-x-[150%] opacity-0" leave-to-class="translate-x-[150%] opacity-0"
			enter-active-class="transition duration-300" leave-active-class="transition duration-300">
			<component :is="Component" />
		</Transition>
	</RouterView>

	<div class="fixed inset-x-2 bottom-3 z-40 space-y-2 md:inset-x-auto md:right-4 md:w-96">
		<div v-if="updateAvailable"
			class="flex items-center justify-between gap-3 rounded-lg border border-primary bg-white p-3 text-sm shadow-lg dark:bg-neutral-900">
			<p>A new version of Lnky is ready.</p>
			<button type="button" class="shrink-0 rounded-lg bg-primary px-3 py-2 font-semibold text-white"
				@click="applyUpdate">
				Reload
			</button>
		</div>

		<div v-else-if="canInstall"
			class="flex items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-white p-3 text-sm shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
			<p>Install Lnky for share-sheet cleaning.</p>
			<button type="button" class="shrink-0 rounded-lg bg-primary px-3 py-2 font-semibold text-white"
				@click="installApp">
				Install
			</button>
		</div>

		<div v-else-if="showIosInstallHint"
			class="flex items-start justify-between gap-3 rounded-lg border border-neutral-300 bg-white p-3 text-sm shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
			<p>On iPhone, tap Share, then <strong>Add to Home Screen</strong> so Lnky opens as an app.</p>
			<button type="button" class="shrink-0 rounded-lg bg-gray-200 px-3 py-2 font-semibold dark:bg-neutral-700"
				@click="dismissIosInstallHint">
				Got it
			</button>
		</div>
	</div>

	<footer class="p-4 text-center text-sm text-gray-500">
		App version: {{ version }}
	</footer>
</template>
