import 'fake-indexeddb/auto'

import { describe, expect, it } from 'vitest'
import { LINKS_DB_NAME, openLinksDb, readShortDomains, writeShortDomains } from '../db'

describe('linksDb', () => {
	it('opens at v3 with a domain-keyed shortLinks store', async () => {
		const db = await openLinksDb()
		expect(db.name).toBe(LINKS_DB_NAME)
		expect(db.version).toBe(3)
		expect(db.objectStoreNames.contains('links')).toBe(true)
		expect(db.objectStoreNames.contains('shortLinks')).toBe(true)
	})

	it('replaces shortener rows on write instead of appending', async () => {
		await writeShortDomains(['t.co', 'bit.ly'])
		await writeShortDomains(['t.co'])
		expect(await readShortDomains()).toEqual(['t.co'])
	})
})
