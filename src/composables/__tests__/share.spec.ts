import { describe, it, expect } from 'vitest'
import { isShareDismissal } from '../share'

describe('isShareDismissal', () => {
	it('treats a cancelled share sheet as a dismissal, not an error', () => {
		expect(isShareDismissal(new DOMException('Share canceled', 'AbortError'))).toBe(true)
	})

	it('does not swallow real failures', () => {
		expect(isShareDismissal(new DOMException('Denied', 'NotAllowedError'))).toBe(false)
		expect(isShareDismissal(new Error('Share canceled'))).toBe(false)
		expect(isShareDismissal('AbortError')).toBe(false)
		expect(isShareDismissal(undefined)).toBe(false)
	})
})
