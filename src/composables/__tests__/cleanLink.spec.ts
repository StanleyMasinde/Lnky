import 'fake-indexeddb/auto'

import { describe, it, expect, vi, afterEach } from 'vitest'
import { useCleanLink } from '../cleanLink'

describe('Link cleaning', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('Clean normal link', async () => {
		const rickRollLink = 'https://youtu.be/dQw4w9WgXcQ?si=9eo5LfnrZJJ-r7yu'

		const cleanedYTLink = await useCleanLink(rickRollLink)
		expect(cleanedYTLink).equals('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
	})

	it('removes TikTok share tracking params including _d', async () => {
		const dirtyTikTok
			= 'https://www.tiktok.com/@user/video/7276913150560128289?_d=secCgYIASAHKAESPgo8&u_code=d9kid8l6gla3a4&share_item_id=7276913150560128289&timestamp=1699103942&share_app_id=1233&_r=1'

		vi.stubGlobal('fetch', vi.fn(() =>
			Promise.resolve({
				text: () => Promise.resolve(dirtyTikTok),
			}),
		))

		const cleaned = await useCleanLink(dirtyTikTok)
		expect(cleaned).toBe('https://www.tiktok.com/@user/video/7276913150560128289')
	})

	it('does not strip timestamp from non-TikTok URLs', async () => {
		const link = 'https://example.com/event?timestamp=1699103942'
		const cleaned = await useCleanLink(link)
		expect(cleaned).toBe(link)
	})
})
