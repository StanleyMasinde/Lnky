<template>
	<!-- Hallmark · genre: editorial · macrostructure: Long Document · design-system: design.md · designed-as-app -->
	<main class="content-page app-main mx-auto w-full max-w-prose px-5 pb-10 pt-8 md:pt-12">
		<h1 class="text-xl font-bold">About Lnky.</h1>

		<p class="mt-6 leading-[1.65]">
			Websites add query parameters to the links you share — <span class="font-mono text-[0.9em]">utm_source</span>,
			<span class="font-mono text-[0.9em]">fbclid</span>, <span class="font-mono text-[0.9em]">ref</span> — so they can
			track who clicked and who sent it. Enough of those, and a site can build a
			profile of you and the people you share with.
		</p>
		<p class="mt-4 leading-[1.65]">
			Lnky removes those parameters before the link leaves your hands. It also
			expands shortened URLs first, so there is nowhere for a tracker to hide.
		</p>

		<h2 class="mt-8 text-lg font-bold">On your home screen</h2>
		<p class="mt-3 leading-[1.65]">
			Lnky works best installed as an app. Share a link from any other app,
			choose Lnky as the target, and the cleaned link is ready to copy or pass
			on. Everything is stored on this device — there is no account and nothing
			to sync.
		</p>

		<h2 class="mt-8 text-lg font-bold">Limits, honestly</h2>
		<p class="mt-3 leading-[1.65]">
			Apple does not let web apps receive shares the way Android does, so on
			iOS the flow is manual: open Lnky, paste, clean, copy. The saved list,
			cleaning, and offline support work the same everywhere.
			<RouterLink to="/" class="font-semibold text-accent underline underline-offset-4 hover:text-ink">Clean a link</RouterLink>.
		</p>
	</main>
</template>
