<script lang="ts" setup>
import { useRoute } from 'vue-router'

const $route = useRoute()
const sharedLink: string = $route.query.link as string
const sharedText: string = $route.query.text as string
const sanitizedLink = (link?: string, text?: string) => {
  let currentLink = ''
  if (link) {
    currentLink = link
  }
  if (text) {
    currentLink = text
  }
  const regex =
    /[?&](utm_[^=]+|pk_[^=]+|fbclid|feature|src|ref|cmp|cmp_id|ref_source|ref_medium|ref_campaign|ref_content|ref_term|gclid|msclkid|yclid)=([^&]+)/gi
  const cleanLink = currentLink?.replace(regex, '')
  return cleanLink?.replace(/[?&]$/, '')
}
const share = async () => {
  if (navigator.share) {
    await navigator.share({
      url: sanitizedLink(sharedLink, sharedText)
    })
  }
}
</script>

<template>
  <main class="flex flex-col justify-end h-screen bg-gray-300">
    <div class="col-span-10 mb-8">
      {{ $route.query }}
    </div>
    <div class="flex flex-col gap-2 mx-3">
      <textarea
        :value="sanitizedLink(sharedLink, sharedText)"
        readonly
        class="w-full rounded-lg"
      ></textarea>
      <button @click.prevent="share" class="border px-4 bg-blue-600 rounded-lg text-white py-2">
        Share
      </button>
    </div>
  </main>
</template>
