<script setup lang="ts">
import { RouterView } from 'vue-router'
import InstallPrompt from './components/InstallPrompt.vue'
import {
	applyUpdate,
	isStandaloneClient,
	openInstallPrompt,
	showInstallPrompt,
	updateAvailable,
} from './pwa/register'

const version = __APP_VERSION__
</script>

<template>
	<!-- Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app -->
	<header class="mx-auto flex w-full max-w-2xl items-center justify-between px-5 pt-5">
		<RouterLink to="/" class="wordmark text-lg text-ink">Lnky</RouterLink>
		<RouterLink to="/about" class="whitespace-nowrap text-sm font-semibold text-ink-2 hover:text-ink">
			About
		</RouterLink>
	</header>

	<RouterView v-slot="{ Component }">
		<Transition name="hl-route">
			<component :is="Component" />
		</Transition>
	</RouterView>

	<div class="fixed inset-x-5 bottom-5 z-toast mx-auto max-w-md space-y-2">
		<div v-if="updateAvailable" role="status"
			class="flex items-center justify-between gap-3 rounded-[10px] border border-solid border-rule bg-paper-2 p-3 text-sm">
			<p>A new version of Lnky is ready.</p>
			<button type="button" class="hl-btn hl-lift shrink-0 whitespace-nowrap rounded-[10px] bg-accent px-3 font-semibold text-accent-ink"
				@click="applyUpdate">
				Reload
			</button>
		</div>
	</div>

	<InstallPrompt />

	<footer class="mx-auto flex w-full max-w-2xl flex-wrap items-baseline justify-between gap-2 px-5 py-6 text-sm text-ink-2">
		<p class="hl-tabnum font-mono text-xs">Lnky {{ version }}</p>
		<button v-if="!isStandaloneClient && !showInstallPrompt" type="button"
			class="whitespace-nowrap font-semibold text-accent underline underline-offset-4 hover:text-ink" data-cy="open-install"
			@click="openInstallPrompt">
			Install app
		</button>
	</footer>
</template>
