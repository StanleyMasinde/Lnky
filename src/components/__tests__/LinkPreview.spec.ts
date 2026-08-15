import { describe, it, expect, vi, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import LinkPreview from '../LinkPreview.vue'

const siteHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Official website of Stanley Masinde, a Software Engineer specializing in fullstack development, systems programming, and Rust.">
  <meta name="keywords" content="Stanley Masinde, Software Engineer, Fullstack Developer, Rust, Vue, Node.js, Laravel">
  <meta name="author" content="Stanley Masinde">
  <meta property="og:title" content="Stanley Masinde - Software Engineer">
  <meta property="og:description" content="Explore the works and articles of Stanley Masinde, a Software Engineer specializing in modern web development and Rust.">
  <meta property="og:image" content="https://stanleymasinde.com/profile-image.jpg">
  <meta property="og:url" content="https://stanleymasinde.com">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Stanley Masinde - Software Engineer">
  <meta name="twitter:description" content="Explore the works and articles of Stanley Masinde.">
  <meta name="twitter:image" content="https://stanleymasinde.com/profile-image.jpg">
  <title>Stanley Masinde - Software Engineer</title>
</head>
<body>
  <h1>Welcome to the Official Website of Stanley Masinde</h1>
</body>
</html>`

const mockHtmlFetch = (html: string) => {
	vi.stubGlobal('fetch', vi.fn(() =>
		Promise.resolve({
			ok: true,
			text: () => Promise.resolve(html),
			json: () => Promise.reject(new Error('not json')),
		}),
	))
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('LinkPreview', () => {
	it('renders properly', async () => {
		mockHtmlFetch(siteHtml)

		const wrapper = mount(LinkPreview, {
			props: {
				url: 'https://stanleymasinde.com',
				timestamp: new Date().toISOString(),
			},
		})

		await flushPromises()
		expect(wrapper.get('#title').text()).toBe('Stanley Masinde - Software Engineer')
		expect(wrapper.get('img').attributes('src')).toBe('https://stanleymasinde.com/profile-image.jpg')
		expect(wrapper.get('#description').text()).toBe('Official website of Stanley Masinde, a Software Engineer specializing in fullstack development, systems programming, and Rust.')
	})

	it('uses YouTube oEmbed for title and thumbnail, not an iframe', async () => {
		vi.stubGlobal('fetch', vi.fn(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve({
					title: 'Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)',
					author_name: 'Rick Astley',
					type: 'video',
					provider_name: 'YouTube',
					html: '<iframe width="200" height="113" src="https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed"></iframe>',
					thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
				}),
			}),
		))

		const wrapper = mount(LinkPreview, {
			props: {
				url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
				timestamp: new Date().toISOString(),
			},
		})

		await flushPromises()
		expect(wrapper.get('#title').text()).toContain('Never Gonna Give You Up')
		expect(wrapper.get('img').attributes('src')).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg')
		expect(wrapper.get('#description').text()).toBe('Rick Astley')
		expect(wrapper.find('iframe').exists()).toBe(false)
		expect(wrapper.find('video').exists()).toBe(false)
		expect(wrapper.find('[data-cy="youtube-embed"]').exists()).toBe(false)
	})

	it('renders a playable video if og:video meta tag is present', async () => {
		mockHtmlFetch(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta property="og:title" content="Video Test">
  <meta property="og:description" content="A test video">
  <meta property="og:video" content="https://example.com/video.mp4">
  <title>Video Test</title>
</head>
<body></body>
</html>`)

		const wrapper = mount(LinkPreview, {
			props: {
				url: 'https://example.com/video',
				timestamp: new Date().toISOString(),
			},
		})

		await flushPromises()
		const video = wrapper.find('video')
		expect(video.exists()).toBe(true)
		expect(video.attributes('src')).toBe('https://example.com/video.mp4')
	})
})
