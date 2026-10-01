import 'fake-indexeddb/auto'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import SavedLinks from './SavedLinks.vue'
import { openLinksDb } from '@/composables/db'

vi.mock('@/components/LinkPreview.vue', () => ({
  default: { props: ['url'], template: '<span>{{ url }}</span>' },
}))

describe('saved link deletion', () => {
  it('animates the final row, then allows Undo to restore its original key', async () => {
    const db = await openLinksDb()
    const timestamp = '2026-10-01T10:00:00.000Z'
    const key = await new Promise<IDBValidKey>((resolve, reject) => {
      const tx = db.transaction('links', 'readwrite')
      const request = tx.objectStore('links').add({ url: 'https://example.com', createdAt: timestamp })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    const wrapper = mount(SavedLinks, { global: { stubs: ['RouterLink'] }, attachTo: document.body })
    await vi.waitFor(() => expect(wrapper.findAll('.saved-list li')).toHaveLength(1))

    await wrapper.get('.saved-list button:last-child').trigger('click')
    await vi.waitFor(() => expect(wrapper.findAll('.saved-list li')).toHaveLength(0))
    expect(wrapper.text()).toContain('Undo')
    await wrapper.get('.hl-toast button').trigger('click')
    await vi.waitFor(() => { expect(wrapper.text()).not.toContain('Could not restore'); expect(wrapper.findAll('.saved-list li')).toHaveLength(1) }, { timeout: 3000 })

    const restored = await new Promise<{ url: string, createdAt: string }>((resolve, reject) => {
      const request = db.transaction('links', 'readonly').objectStore('links').get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    expect(restored).toEqual({ url: 'https://example.com', createdAt: timestamp })
    wrapper.unmount()
    db.close()
  })
})
