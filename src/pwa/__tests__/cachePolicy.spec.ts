import { describe, expect, it } from 'vitest'
import { shouldCacheResponse } from '../cachePolicy'

const origin = 'https://lnky.stanleymasinde.com'

describe('shouldCacheResponse', () => {
	it('caches same-origin GET successes', () => {
		expect(shouldCacheResponse(`${origin}/assets/app.js`, 'GET', true, origin)).toBe(true)
	})

	it('does not cache the expander API', () => {
		expect(shouldCacheResponse(
			'https://lnky.api.stanleymasinde.com/?url=https://t.co/x',
			'GET',
			true,
			origin,
		)).toBe(false)
	})

	it('does not cache the GitHub shortener list', () => {
		expect(shouldCacheResponse(
			'https://raw.githubusercontent.com/PeterDaveHello/url-shorteners/refs/heads/master/list',
			'GET',
			true,
			origin,
		)).toBe(false)
	})

	it('does not cache failed or non-GET responses', () => {
		expect(shouldCacheResponse(`${origin}/`, 'GET', false, origin)).toBe(false)
		expect(shouldCacheResponse(`${origin}/`, 'POST', true, origin)).toBe(false)
	})
})
