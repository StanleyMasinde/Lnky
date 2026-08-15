/// <reference lib="webworker" />
export { }
/*
 * -----------------------------------------------------------
 *  Main service worker file
 *  This new version was created on 2025-02-12
 *  Copyright (c) 2025 Stanley Masinde. All Rights Reserved.
 *  ----------------------------------------------------------
 */

import { shouldCacheResponse } from './pwa/cachePolicy'

const cacheVersion = `lnky-${__APP_VERSION__}`
const sw = self as unknown as ServiceWorkerGlobalScope

const staticCache = [
	'/',
	'/icons/favicon.ico',
	'/manifest.json',
	'/saved-links',
	'/icons/icon-192.png',
	'/icons/icon-512.png',
	'/icons/apple-touch-icon.png',
	'/icons/icon-192-maskable.png',
	'/icons/icon-512-maskable.png',
]

const offlineResponse = () => new Response('It looks like you are offline', {
	status: 503,
	headers: { 'Content-Type': 'text/plain; charset=utf-8' },
})

const precache = async () => {
	const cache = await caches.open(cacheVersion)
	await Promise.all(staticCache.map(async (url) => {
		try {
			await cache.add(url)
		}
		catch {
			// A missing file must not fail the whole install.
		}
	}))
}

const handleFetch = async (request: Request): Promise<Response> => {
	if (request.mode === 'navigate') {
		try {
			const networkResponse = await fetch(request)
			if (networkResponse.ok) {
				const cache = await caches.open(cacheVersion)
				await cache.put('/', networkResponse.clone())
			}
			return networkResponse
		}
		catch {
			const cache = await caches.open(cacheVersion)
			const fallback = await cache.match('/')
			if (fallback) {
				return fallback
			}
			return offlineResponse()
		}
	}

	const cache = await caches.open(cacheVersion)
	const cached = await cache.match(request)
	if (cached) {
		return cached
	}

	try {
		const networkResponse = await fetch(request)
		if (shouldCacheResponse(request.url, request.method, networkResponse.ok, sw.location.origin)) {
			await cache.put(request, networkResponse.clone())
		}
		return networkResponse
	}
	catch {
		return offlineResponse()
	}
}

sw.addEventListener('install', (event) => {
	event.waitUntil(precache())
})

sw.addEventListener('activate', (event) => {
	event.waitUntil((async () => {
		const keys = await caches.keys()
		await Promise.all(
			keys
				.filter((name) => name !== cacheVersion)
				.map((name) => caches.delete(name)),
		)
		await sw.clients.claim()
	})())
})

sw.addEventListener('message', (event) => {
	const data = event.data as { type?: string } | string | undefined
	if (data === 'SKIP_WAITING' || (typeof data === 'object' && data?.type === 'SKIP_WAITING')) {
		void sw.skipWaiting()
	}
})

sw.addEventListener('fetch', (event) => {
	event.respondWith(handleFetch(event.request))
})
