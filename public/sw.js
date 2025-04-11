/*
 * -----------------------------------------------------------
 *  Main service worker file
 *  This new version was created on 2025-02-12
 *  Copyright (c) 2025 Stanley Masinde. All Rights Reserved.
 *  ----------------------------------------------------------
 */

const cacheVersion = 'v1.5.0'
const staticCache = [
	'/',
	'/icons/favicon.ico',
	'/manifest.json',
	'/saved-links',
	'/icons/icon-192x192.png',
	'/icons/icon-256x256.png',
	'/icons/icon-384x384.png',
	'/icons/icon-512x512.png',
	'/icons/apple-touch-icon.png',
	'/icons/icon-192-maskable.png',
	'/icons/icon-512-maskable.png',
]

const notToCacheURLs = [
	'lnky.api.stanleymasinde.com',
	'raw.githubusercontent.com/PeterDaveHello/url-shorteners/refs/heads/master/list',
]

// Handle fetch
const handleFetch = async (request) => {
	if (request.mode === 'navigate') {
		const cache = await caches.open(cacheVersion)
		const fallback = await cache.match('/')
		if (fallback) return fallback
	}

	const responseFromCache = await caches.match(request)
	if (responseFromCache) {
		return responseFromCache
	}

	try {
		const networkResponse = await fetch(request)
		if (!notToCacheURLs.includes(request.url)) { // Do not cache link expander reqs
			const clonedResponse = networkResponse.clone()
			const cache = await caches.open(cacheVersion)
			await cache.put(request, clonedResponse)
		}

		return networkResponse
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	catch (error) {
		return new Response('It looks like you are offline', { status: 503 })
	}
}

// Install event
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(cacheVersion)
			.then((cacheStore) => {
				cacheStore.addAll(staticCache)
			}),
	)
})

// Activate event
self.addEventListener('activate', (event) => {
	const cacheToKeep = cacheVersion
	event.waitUntil(
		caches
			.keys()
			.then(async (keys) => {
				await Promise.all(
					keys.map((cacheName) => {
						if (cacheName !== cacheToKeep) {
							return caches.delete(cacheName)
						}
					}),
				)
			}),
	)
})

// Fetch event
self.addEventListener('fetch', (event) => {
	event.respondWith(handleFetch(event.request))
})
