import { describe, expect, it } from 'vitest'
import {
	canonicalRedditUrl,
	getOEmbedConfig,
	isRedditUrl,
	isTweetUrl,
	isYouTubeUrl,
	parseOEmbedResponse,
	toLiveTweetHtml,
	toStaticTweetHtml,
} from '../oembed'

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
		expect(isRedditUrl('https://www.reddit.com/comments/92dd8')).toBe(true)
		expect(isRedditUrl('https://redd.it/92dd8')).toBe(true)
		expect(isRedditUrl('https://www.reddit.com/r/pics/')).toBe(true)
		expect(isRedditUrl('https://www.reddit.com/r/pics/s/AbCdEf')).toBe(true)
		expect(isRedditUrl('https://example.com/r/pics/comments/92dd8')).toBe(false)
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
		expect(config?.endpoint).toContain('dnt=true')
		expect(config?.endpoint).toContain('omit_script=1')
		expect(config?.scriptSrc).toBe('https://platform.twitter.com/widgets.js')
	})

	it('keeps tweet markup inert until the official widget is requested', () => {
		const html = '<blockquote class="twitter-tweet"><p>hi</p></blockquote><script src="https://platform.twitter.com/widgets.js"></script>'
		expect(toStaticTweetHtml(html)).toBe('<blockquote class="twitter-tweet-static"><p>hi</p></blockquote>')
		expect(toLiveTweetHtml(html)).toBe('<blockquote data-dnt="true" class="twitter-tweet"><p>hi</p></blockquote>')
	})

	it('builds the Reddit oEmbed endpoint from a canonical post URL', () => {
		const config = getOEmbedConfig('https://www.reddit.com/r/pics/comments/92dd8/test_post_please_ignore/')
		expect(config?.provider).toBe('reddit')
		expect(config?.endpoint).toContain('https://www.reddit.com/oembed')
		expect(config?.endpoint).toContain(encodeURIComponent('https://www.reddit.com/r/pics/comments/92dd8'))
		expect(config?.scriptSrc).toBeUndefined()
	})

	it('rewrites redd.it and /comments/{id} URLs so oEmbed accepts them', () => {
		expect(canonicalRedditUrl('https://redd.it/92dd8')).toBe('https://www.reddit.com/r/all/comments/92dd8')
		expect(canonicalRedditUrl('https://www.reddit.com/comments/92dd8')).toBe('https://www.reddit.com/r/all/comments/92dd8')

		const short = getOEmbedConfig('https://redd.it/92dd8')
		expect(short?.endpoint).toContain(encodeURIComponent('https://www.reddit.com/r/all/comments/92dd8'))
	})

	it('still builds an oEmbed request for Reddit share URLs', () => {
		const config = getOEmbedConfig('https://www.reddit.com/r/pics/s/AbCdEf')
		expect(config?.provider).toBe('reddit')
		expect(config?.endpoint).toContain('https://www.reddit.com/oembed')
	})

	it('ignores non-JSON Reddit oEmbed bodies instead of throwing', () => {
		expect(parseOEmbedResponse('invalid URL value')).toBeNull()
		expect(parseOEmbedResponse('{"title":"ok"}')?.title).toBe('ok')
	})
})
