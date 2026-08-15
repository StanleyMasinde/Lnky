import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import InstallPrompt from '../InstallPrompt.vue'
import { showInstallPrompt } from '@/pwa/register'

describe('InstallPrompt', () => {
	let wrapper: VueWrapper

	afterEach(() => {
		wrapper?.unmount()
		showInstallPrompt.value = false
	})

	it('renders a closed native dialog by default', () => {
		wrapper = mount(InstallPrompt)
		const dialog = wrapper.get('[data-cy="install-prompt"]')

		expect(dialog.element.tagName).toBe('DIALOG')
		expect((dialog.element as HTMLDialogElement).open).toBe(false)
	})

	it('opens with showModal when the prompt is requested', async () => {
		wrapper = mount(InstallPrompt)
		const dialog = wrapper.get('[data-cy="install-prompt"]').element as HTMLDialogElement
		dialog.showModal = vi.fn()

		showInstallPrompt.value = true
		await nextTick()
		await nextTick()

		expect(dialog.showModal).toHaveBeenCalled()
	})
})
