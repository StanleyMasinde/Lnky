import { describe, expect, it } from 'vitest'
import { isIosDevice, isStandaloneDisplay, shouldAutoPromptInstall } from '../installPrompt'

describe('install prompt visibility', () => {
	it('treats standalone display-mode or iOS standalone as installed', () => {
		expect(isStandaloneDisplay(true, false)).toBe(true)
		expect(isStandaloneDisplay(false, true)).toBe(true)
		expect(isStandaloneDisplay(false, false)).toBe(false)
	})

	it('detects iPhone and iPad', () => {
		expect(isIosDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', 'iPhone', 5)).toBe(true)
		expect(isIosDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'MacIntel', 5)).toBe(true)
		expect(isIosDevice('Mozilla/5.0 (Linux; Android 14)', 'Linux armv8l', 5)).toBe(false)
	})

	it('auto-opens once, but not during a share-target launch', () => {
		expect(shouldAutoPromptInstall('', false, false)).toBe(true)
		expect(shouldAutoPromptInstall('?url=https://example.com', false, false)).toBe(false)
		expect(shouldAutoPromptInstall('?text=https://example.com', false, false)).toBe(false)
		expect(shouldAutoPromptInstall('', true, false)).toBe(false)
		expect(shouldAutoPromptInstall('', false, true)).toBe(false)
	})
})
