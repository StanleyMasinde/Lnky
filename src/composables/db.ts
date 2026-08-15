export const LINKS_DB_NAME = 'linksDb'
export const LINKS_DB_VERSION = 3

export function upgradeLinksDb(database: IDBDatabase, oldVersion: number): void {
	if (!database.objectStoreNames.contains('links')) {
		const objectStore = database.createObjectStore('links', { autoIncrement: true })
		objectStore.createIndex('url', 'url', { unique: true })
		objectStore.createIndex('createdAt', 'createdAt')
	}

	// v3 keys shortener domains so refreshes replace rows instead of appending forever.
	if (oldVersion < 3 && database.objectStoreNames.contains('shortLinks')) {
		database.deleteObjectStore('shortLinks')
	}

	if (!database.objectStoreNames.contains('shortLinks')) {
		database.createObjectStore('shortLinks', { keyPath: 'domain' })
	}
}

export function openLinksDb(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = window.indexedDB.open(LINKS_DB_NAME, LINKS_DB_VERSION)

		request.onupgradeneeded = (event) => {
			upgradeLinksDb(
				(event.target as IDBOpenDBRequest).result,
				event.oldVersion,
			)
		}

		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error ?? new Error('Failed to open linksDb'))
	})
}

export async function saveCleanedLink(link: string): Promise<void> {
	const database = await openLinksDb()
	await new Promise<void>((resolve, reject) => {
		const transaction = database.transaction('links', 'readwrite')
		const request = transaction.objectStore('links').add({
			url: link,
			createdAt: new Date().toISOString(),
		})

		request.onerror = () => {
			// Unique url index: ignore duplicates from share + clean + copy.
			resolve()
		}
		transaction.oncomplete = () => resolve()
		transaction.onerror = () => reject(transaction.error)
	})
}

export async function readShortDomains(): Promise<string[]> {
	const database = await openLinksDb()

	return new Promise((resolve, reject) => {
		const request = database.transaction('shortLinks', 'readonly').objectStore('shortLinks').getAll()
		request.onsuccess = () => {
			const rows = request.result as Array<{ domain: string }>
			resolve(rows.map((row) => row.domain).filter(Boolean))
		}
		request.onerror = () => reject(request.error)
	})
}

export async function writeShortDomains(domains: string[]): Promise<void> {
	const database = await openLinksDb()

	await new Promise<void>((resolve, reject) => {
		const transaction = database.transaction('shortLinks', 'readwrite')
		const store = transaction.objectStore('shortLinks')
		store.clear()
		for (const domain of domains) {
			store.put({ domain })
		}
		transaction.oncomplete = () => resolve()
		transaction.onerror = () => reject(transaction.error)
	})
}
