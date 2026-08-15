import { describe, expect, it } from 'vitest'
import { getOEmbedConfig, isTweetUrl, isYouTubeUrl, responsiveOEmbedHtml } from '../oembed'

describe('oEmbed helpers', () => {
	it('detects tweet and YouTube URLs', () => {
		expect(isTweetUrl('https://x.com/user/status/123')).toBe(true)
		expect(isTweetUrl('https://twitter.com/user/status/123')).toBe(true)
		expect(isTweetUrl('https://example.com/status/123')).toBe(false)

		expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
		expect(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
		expect(isYouTubeUrl('https://www.youtube.com/shorts/abc123')).toBe(true)
		expect(isYouTubeUrl('https://music.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
		expect(isYouTubeUrl('https://example.com/watch?v=dQw4w9WgXcQ')).toBe(false)
	})

	it('builds the YouTube oEmbed endpoint', () => {
		const config = getOEmbedConfig('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
		expect(config?.provider).toBe('youtube')
		expect(config?.endpoint).toContain('https://www.youtube.com/oembed')
		expect(config?.endpoint).toContain('format=json')
		expect(config?.scriptSrc).toBeUndefined()
	})

	it('builds the Twitter oEmbed endpoint', () => {
		const config = getOEmbedConfig('https://twitter.com/user/status/123')
		expect(config?.provider).toBe('twitter')
		expect(config?.endpoint).toContain('publish.twitter.com/oembed')
		expect(config?.scriptSrc).toBe('https://platform.twitter.com/widgets.js')
	})

	it('makes YouTube iframe markup fill its container', () => {
		const html = '<iframe width="200" height="113" src="https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed"></iframe>'
		expect(responsiveOEmbedHtml(html, 'youtube')).toBe(
			'<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed"></iframe>',
		)
	})
})
