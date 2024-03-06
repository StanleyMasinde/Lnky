// https://on.cypress.io/api

describe('Test share links', () => {
  it('Handles share', () => {
    cy.visit('/handle-link')
    cy.get('h1').contains('No valid link found').should('exist')
    cy.visit('/handle-link/?text=https://twitter.com/stanleymasinde_/status/1550923031366799360?s=61&t=BNJg84U0lFMEudJeRBQEhw')
    cy.get('button').contains('Share').should('exist')
  })
})
