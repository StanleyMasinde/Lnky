import { describe, it, expect } from 'vitest'
import { useCleanLink } from '../cleanLink'

describe('Link cleaning', () => {
	it('Clean normal link', async () => {
		const rickRollLink = 'https://youtu.be/dQw4w9WgXcQ?si=9eo5LfnrZJJ-r7yu'
		const cleanedYTLink = await useCleanLink(rickRollLink)
		expect(cleanedYTLink).equals('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
	})
})
