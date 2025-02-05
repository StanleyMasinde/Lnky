describe('Link Cleaning Tool', () => {
	// Define test cases for different tracking parameters with real URLs
	const testCases = [
		{ input: 'https://www.facebook.com/?fbclid=IwAR2LfFq0r06tmjKZXVkPf-B7bSoVwEaSzg6XYXHfrwQgCWL2xaBvaxVsP3k', expected: 'https://www.facebook.com/' },
		{ input: 'https://www.amazon.com/dp/B09XYZ123?tag=affiliateid-20&utm_campaign=summer_sale', expected: 'https://www.amazon.com/dp/B09XYZ123' },
		{ input: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=abc123&feature=youtu.be&ab_channel=RickAstley', expected: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
		{ input: 'https://twitter.com/example/status/1234567890?utm_source=twitter&utm_campaign=summer2025', expected: 'https://twitter.com/example/status/1234567890' },
		{ input: 'https://www.instagram.com/p/xyz123/?igshid=abc123', expected: 'https://www.instagram.com/p/xyz123/' },
		{ input: 'https://www.linkedin.com/feed/update/urn:li:activity:123456789/?li_fat_id=abcdefg12345', expected: 'https://www.linkedin.com/feed/update/urn:li:activity:123456789/' },
		{ input: 'https://www.tiktok.com/@example/video/1234567890?ttclid=abcdef', expected: 'https://www.tiktok.com/@example/video/1234567890' },
		{ input: 'https://www.example.com/?ref=affiliate&utm_source=google&utm_campaign=spring_sale', expected: 'https://www.example.com/' },
	]

	beforeEach(() => {
		cy.visit('/')
		cy.get('#linkInput').should('exist')
		cy.get('#cleanButton').should('exist')
		cy.get('#cleanedOutput').should('exist')
	})

	Cypress._.each(testCases, ({ input, expected }) => {
		it(`cleans tracking parameters from: ${input}`, () => {
			cy.get('#linkInput').clear().type(input)
			cy.get('#cleanButton').click()
			cy.wait(1000)
			cy.get('#cleanedOutput').should('have.value', expected)
		})
	})

	it('handles empty input gracefully', () => {
		cy.get('#linkInput').clear()
		cy.get('#cleanButton').click()
		cy.wait(1000)
		cy.get('#cleanedOutput').should('have.value', '')
	})
})
