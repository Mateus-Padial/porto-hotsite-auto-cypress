/// <reference types="cypress" />
import selectors from '../gui/elements/home_elements';

describe('Acesso ao hotsite usuario logando', () => {
  beforeEach(() => {
    cy.loginComSSO();
  });

  it('Validar usuario logando no hotsite porto', () => {
    cy.get(selectors.imgUser).should('be.visible');
    cy.get(selectors.txtNomeUsuario).should('be.visible');
  });
});
