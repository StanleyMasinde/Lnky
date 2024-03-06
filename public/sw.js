/**
 * The main service worker file. 
 * Author: Stanley Masinde
 */
const version = 'v0.1.5'
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(version).then(async(cache) => {
           await cache.addAll([
                '/',
				'/about',
                '/handle-link'
            ])
        }).then(() => self.skipWaiting())
    )
})

// // ----------------------------------------------------------------------------
// // Service worker activation.
// // ----------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
	console.log('[Service Worker] Activating Service Worker ...')
	event.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(keyList.map((key) => {
				console.log('[Service Worker] Removing old cache.', key)
				return caches.delete(key)
			}))
		})
	)
	return self.clients.claim()
})

// // ----------------------------------------------------------------------------
// // Service worker fetch event.
// // ----------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
	console.log('[Service Worker] Fetching resource: ', event.request.url)
	event.respondWith(
		caches.open(version).then(async (cache) => {
			const response = await cache.match(event.request)
			return response || fetch(event.request).then((response_1) => {
				cache.put(event.request, response_1.clone())
				return response_1
			})
		})
	)
})