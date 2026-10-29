afterEach(function () {
  try {
    if (this.currentTest?.state === 'failed') {
      const testTitle = this.currentTest.title || 'sem_nome';
      const fileName = `FAILED_${testTitle.replace(/\s+/g, '_')}`;
      cy.screenshot(fileName, { capture: 'runner' });
    }
  } catch (e) {
    // evita quebrar o hook
    Cypress.log({
      name: 'afterEach',
      message: 'Erro ao capturar screenshot',
    });
  }
});

beforeEach(() => {
  cy.intercept('GET', '**/Feature-Flag/**', {
    statusCode: 200,
    body: {},
  }).as('featureFlag');

  cy.intercept('POST', '**google-analytics**', { statusCode: 204 });
});
