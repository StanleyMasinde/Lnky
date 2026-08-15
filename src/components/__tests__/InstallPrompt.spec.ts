import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import InstallPrompt from '../InstallPrompt.vue'
import { showInstallPrompt } from '@/pwa/register'

describe('InstallPrompt', () => {
	afterEach(() => {
		showInstallPrompt.value = false
	})

	it('is hidden by default', () => {
		const wrapper = mount(InstallPrompt)
		expect(wrapper.find('[data-cy="install-prompt"]').exists()).toBe(false)
	})

	it('shows the install dialog when opened', () => {
		showInstallPrompt.value = true
		const wrapper = mount(InstallPrompt)
		expect(wrapper.find('[data-cy="install-prompt"]').exists()).toBe(true)
		expect(wrapper.text()).toContain('Install Lnky')
	})
})
