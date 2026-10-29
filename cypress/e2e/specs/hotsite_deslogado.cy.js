/// <reference types="cypress" />
import selector from '../elements/home_elements.js';

const meuPortoUrl = Cypress.env('meu_porto_url');

describe('Acesso ao hotsite usuario deslogado', () => {
  beforeEach(() => {
    cy.visit(meuPortoUrl);
  });

  it('Validar as informações exibidas na home - usuário deslogado', () => {
    cy.get(selector.imgUser).should('be.visible');
    cy.get(selector.txtEntrar).should('be.visible');
    cy.get(selector.banner).should('be.visible');
  });
});
