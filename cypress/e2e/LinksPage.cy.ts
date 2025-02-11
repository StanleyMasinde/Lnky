describe('Saved links feature', () => {
	beforeEach(() => {
		// Clear IndexedDB before each test
		cy.window().then(() => {
			indexedDB.databases().then((dbs) => {
				dbs.forEach((db) => {
					if (db.name) {
						indexedDB.deleteDatabase(db.name)
					}
				})
			})
		})

		cy.visit('/')
	})

	it('should clean and save links', () => {
		const dirtyUrl = 'https://example.com?utm_source=tracker&ref=ads'

		// Enter the URL in the input field
		cy.get('[data-cy=url-input]').type(dirtyUrl)

		// Click the clean button
		cy.get('[data-cy=clean-button]').click()

		// Verify that the URL is cleaned
		cy.get('[data-cy=cleaned-url]').should('not.have.value', 'utm_source')
		cy.get('[data-cy=cleaned-url]').should('not.have.value', 'ref=')

		cy.get('[data-cy=share-button]').click()
	})

	it('should display saved links on the saved links page', () => {
		// Visit saved links page
		cy.get('[data-cy=saved-links-link]').click()

		// Ensure the page loads
		cy.url().should('include', '/saved-links')

		// Check if at least one saved link is visible
		cy.get('[data-cy=saved-link-item]').should('have.length.greaterThan', 0)
	})
})
