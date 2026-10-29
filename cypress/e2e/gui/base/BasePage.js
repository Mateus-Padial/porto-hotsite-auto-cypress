import Timeouts from '../../../support/constants/Timeouts.js';

class BasePage {
  constructor() {
    this.baseUrl = Cypress.env('base_url') || Cypress.config('baseUrl');
    this.meuPortoUrl = Cypress.env('meu_porto_url');
  }

  visit(url, options = {}) {
    const defaultOptions = {
      failOnStatusCode: false,
      timeout: Timeouts.PAGE_LOAD,
    };
    cy.visit(url, { ...defaultOptions, ...options });
    return this;
  }

  waitForElement(selector, timeout = Timeouts.ELEMENT_VISIBLE) {
    return cy.get(selector, { timeout }).should('be.visible');
  }

  waitForElementExist(selector, timeout = Timeouts.ELEMENT_VISIBLE) {
    return cy.get(selector, { timeout }).should('exist');
  }

  clickWithJS(selector, { timeout = Timeouts.ELEMENT_VISIBLE, removeTarget = false } = {}) {
    let chain = cy.get(selector, { timeout });
    if (removeTarget) {
      chain = chain.invoke('removeAttr', 'target');
    }
    chain.then(($el) => {
      if ($el.length) {
        $el[0].click();
      }
    });
    return this;
  }

  // Resolve uma chave em um mapa de acoes/valores; lanca erro padronizado se nao mapeada.
  resolverDoMapa(mapa, chave, rotulo = 'Item') {
    if (!(chave in mapa)) {
      throw new Error(`${rotulo} não mapeado: ${chave}`);
    }
    return mapa[chave];
  }

  // Espera o elemento ficar visivel e clica de forma segura (no-op se ausente).
  // Distinto de clickWithJS, que nao aguarda visibilidade.
  clickQuandoVisivel(selector, { timeout = Timeouts.ELEMENT_VISIBLE, force = false } = {}) {
    cy.get(selector, { timeout })
      .should('be.visible')
      .then(($el) => {
        if ($el.length) {
          $el[0].click(force ? { force: true } : undefined);
        }
      });
    return this;
  }

  clickElement(selector, options = {}) {
    cy.get(selector, { timeout: Timeouts.ELEMENT_VISIBLE }).should('be.visible').click(options);
    return this;
  }

  validateUrlContains(urlPart, timeout = Timeouts.MEDIUM) {
    cy.url({ timeout }).should('include', urlPart);
    return this;
  }

  validateUrlEquals(expectedUrl, timeout = Timeouts.MEDIUM) {
    cy.url({ timeout }).should('eq', expectedUrl);
    return this;
  }

  scrollToElement(selector) {
    cy.get(selector).scrollIntoView();
    return this;
  }

  waitForRequest(alias, timeout = Timeouts.API_REQUEST) {
    return cy.wait(`@${alias}`, { timeout });
  }

  removeTargetAttribute(selector) {
    cy.get(selector).invoke('removeAttr', 'target');
    return this;
  }

  validateElementVisible(selector, timeout = Timeouts.ELEMENT_VISIBLE) {
    cy.get(selector, { timeout }).should('be.visible');
    return this;
  }

  validateElementExists(selector, timeout = Timeouts.ELEMENT_VISIBLE) {
    cy.get(selector, { timeout }).should('exist');
    return this;
  }

  wait(ms) {
    cy.wait(ms);
    return this;
  }

  getCurrentUrl() {
    return cy.url();
  }

  stubWindowOpen() {
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });
    return this;
  }

  validateWindowOpenCalled(expectedUrl = null) {
    if (expectedUrl) {
      cy.get('@windowOpen', { timeout: Timeouts.LONG }).should(
        'have.been.calledWithMatch',
        expectedUrl,
      );
    } else {
      cy.get('@windowOpen', { timeout: Timeouts.LONG }).should('have.been.called');
    }
    return this;
  }
}

export default BasePage;
