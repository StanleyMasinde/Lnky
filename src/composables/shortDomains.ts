import { readShortDomains, writeShortDomains } from './db'

export const SHORTENER_LIST_URL
	= 'https://raw.githubusercontent.com/PeterDaveHello/url-shorteners/refs/heads/master/list'

let shortDomains: string[] = import.meta.env.TEST ? ['youtu.be'] : []
let hydratePromise: Promise<void> | null = null

export function getShortDomains(): string[] {
	return shortDomains
}

export function parseShortenerList(text: string): string[] {
	return text
		.split('\n')
		.map((line) => line.trim())
		.filter((domain) => domain && !domain.startsWith('#') && URL.canParse(`https://${domain}`))
}

export async function refreshShortenerList(): Promise<void> {
	if (import.meta.env.TEST) {
		return
	}

	const response = await fetch(SHORTENER_LIST_URL)
	if (!response.ok) {
		return
	}

	const domains = parseShortenerList(await response.text())
	if (!domains.length) {
		return
	}

	shortDomains = domains
	await writeShortDomains(domains)
}

async function hydrateFromDb(): Promise<void> {
	if (import.meta.env.TEST) {
		shortDomains = ['youtu.be']
		return
	}

	try {
		const fromDb = await readShortDomains()
		if (fromDb.length) {
			shortDomains = fromDb
		}
	}
	catch {
		// First visit or private mode without IDB — network refresh may still fill this in.
	}
}

export function hydrateShortDomains(): Promise<void> {
	if (!hydratePromise) {
		hydratePromise = hydrateFromDb().finally(() => {
			void refreshShortenerList().catch(() => {
				// Offline: keep whatever IDB already had.
			})
		})
	}

	return hydratePromise
}

export async function ensureShortDomains(): Promise<string[]> {
	if (!import.meta.env.TEST) {
		await hydrateShortDomains()
	}

	return shortDomains
}
