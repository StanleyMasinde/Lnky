import { describe, expect, it } from 'vitest'
import { getOEmbedConfig, isRedditUrl, isTweetUrl, isYouTubeUrl } from '../oembed'

describe('oEmbed helpers', () => {
	it('detects tweet, YouTube, and Reddit URLs', () => {
		expect(isTweetUrl('https://x.com/user/status/123')).toBe(true)
		expect(isTweetUrl('https://twitter.com/user/status/123')).toBe(true)
		expect(isTweetUrl('https://example.com/status/123')).toBe(false)

		expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
		expect(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
		expect(isYouTubeUrl('https://www.youtube.com/shorts/abc123')).toBe(true)
		expect(isYouTubeUrl('https://music.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
		expect(isYouTubeUrl('https://example.com/watch?v=dQw4w9WgXcQ')).toBe(false)

		expect(isRedditUrl('https://www.reddit.com/r/pics/comments/92dd8/test_post_please_ignore/')).toBe(true)
		expect(isRedditUrl('https://old.reddit.com/r/pics/comments/92dd8/test_post_please_ignore/')).toBe(true)
		expect(isRedditUrl('https://redd.it/92dd8')).toBe(true)
		expect(isRedditUrl('https://www.reddit.com/r/pics/')).toBe(false)
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

	it('builds the Reddit oEmbed endpoint', () => {
		const config = getOEmbedConfig('https://www.reddit.com/r/pics/comments/92dd8/test_post_please_ignore/')
		expect(config?.provider).toBe('reddit')
		expect(config?.endpoint).toContain('https://www.reddit.com/oembed')
		expect(config?.scriptSrc).toBe('https://embed.reddit.com/widgets.js')
	})
})
