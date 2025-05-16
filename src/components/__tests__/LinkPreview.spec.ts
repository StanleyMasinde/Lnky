import { describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import LinkPreview from '../LinkPreview.vue'

vi.stubGlobal('fetch', vi.fn(() =>
	Promise.resolve({
		text: () => Promise.resolve(`<!DOCTYPE html>
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
</html>`),
	}),
))

describe('LinkPreview', () => {
	it('renders properly', async () => {
		const wrapper = mount(LinkPreview, {
			props: {
				url: 'https://stanleymasinde.com',
			},
		})

		await flushPromises()
		expect(wrapper.get('#title').text()).toBe('Stanley Masinde - Software Engineer')
		expect(wrapper.get('img').attributes('src')).toBe('https://stanleymasinde.com/profile-image.jpg')
		expect(wrapper.get('#description').text()).toBe('Official website of Stanley Masinde, a Software Engineer specializing in fullstack development, systems programming, and Rust.')
	})
})
