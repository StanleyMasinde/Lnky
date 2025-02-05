<script setup lang="ts">
import { ref, Ref } from 'vue'
const sanitizedLink: Ref<string | undefined> = ref()
const currentLink: Ref<string | undefined> = ref()
// Listen to changes on the
const cleanLink = () => {
	if (!currentLink.value) return // Ensure the input link is not null or undefined

	const regex = /[?&](utm_[^=]+|pk_[^=]+|fbclid|feature|si|t|src|ref|cmp|cmp_id|ref_source|ref_medium|ref_campaign|ref_content|ref_term|gclid|msclkid|yclid|igshid|li_fat_id|ttclid|sa|ust|ab_channel|source|sa=D|source=editors|ab|referral|ref_tag|referring_source|click_id|ad_id|tag|q)=([^&]+)/gi

	// Remove all matched query parameters from the link
	let cleanedLink = currentLink.value.replace(regex, '')

	// Clean up any trailing '?' or '&' at the end of the URL
	cleanedLink = cleanedLink.replace(/[?&]$/, '')

	// Set the cleaned URL
	sanitizedLink.value = cleanedLink
}

</script>

<template>
	<main class="grid grid-cols-12 grid-rows-2 place-items-center h-screen">
		<div class="col-span-12">
			<div class="border-2 border-primary rounded-lg p-5">
				<h1 class="font-medium text-lg">Welcome to Lnky</h1>
				<div>
					<form @submit.prevent="cleanLink()">
						<div class="flex flex-col gap-4">
							<div>
								<label for="linkInput" @change="onLinkInputChange">Paste the link below</label>
								<input v-model="currentLink" class="w-full rounded-lg" type="url" id="linkInput"
									placeholder="Paste the URL here" />
							</div>

							<div>
								<button class="bg-primary text-white rounded-lg w-full p-2" id="cleanButton">
									Clean link
								</button>
							</div>
						</div>
					</form>

					<hr>

					<div class="flex flex-col gap-2 mt-5">
						<textarea id="cleanedOutput" :value="sanitizedLink" readonly
							class="w-full rounded-lg"></textarea>
						<button @click.prevent="share" class="border px-4 bg-primary rounded-lg text-white py-2">
							Share
						</button>
					</div>
				</div>
			</div>
		</div>
	</main>
</template>
