import { describe, expect, it } from 'vitest'
import { extractSharedUrl } from '../extractSharedUrl'

describe('extractSharedUrl', () => {
	it('prefers the url param', () => {
		expect(extractSharedUrl({
			url: 'https://youtu.be/dQw4w9WgXcQ',
			text: 'https://example.com',
		})).toBe('https://youtu.be/dQw4w9WgXcQ')
	})

	it('pulls a URL out of Android share text', () => {
		expect(extractSharedUrl({
			title: 'Check this out',
			text: 'Check this out https://www.tiktok.com/@user/video/1?_r=1',
		})).toBe('https://www.tiktok.com/@user/video/1?_r=1')
	})

	it('accepts a bare URL in title', () => {
		expect(extractSharedUrl({
			title: 'https://example.com/a?utm_source=x',
		})).toBe('https://example.com/a?utm_source=x')
	})

	it('unwraps web+lnky protocol handler values', () => {
		expect(extractSharedUrl({
			url: 'web+lnky:https://example.com/path',
		})).toBe('https://example.com/path')
	})

	it('returns undefined when nothing looks like a URL', () => {
		expect(extractSharedUrl({
			title: 'hello',
			text: 'no link here',
		})).toBeUndefined()
	})
})
