import BasePage from '../../base/BasePage.js';
import SobreOPortoPlusElements from '../../elements/cenario_deslogado/SobreOPortoPlusElements.js';
import Timeouts from '../../../../support/constants/Timeouts.js';

class SobreOPortoPlusPage extends BasePage {
  constructor() {
    super();
    this.elements = new SobreOPortoPlusElements();
  }

  validaDirecionamentoSobrePorto() {
    this.validateUrlContains('/sobre-o-portoplus');
    return this;
  }

  validaRegulamentoSobrePortoPlus() {
    this.scrollToElement(this.elements.txtRegulamentoSobrePorto);
    this.validateElementVisible(this.elements.txtRegulamentoSobrePorto);
    this.clickElement(this.elements.txtRegulamentoSobrePorto);

    this.scrollToElement(this.elements.txtRegulamentoSobrePorto);
    this.validateElementVisible(this.elements.txtRegulamentoSobrePorto);
    this.clickElement(this.elements.txtRegulamentoSobrePorto);
    cy.get(this.elements.linkDownload, { timeout: 10000 }).should('exist');

    return this;
  }

  validaDownloadRegulamentoPortoPlus() {
    cy.get(this.elements.linkDownload).should('have.attr', 'href').and('include', '.pdf');
    cy.get(this.elements.linkDownload).click();
    return this;
  }

  validaDirecionamentoPdfRegulamento() {
    cy.get(this.elements.imgDownload).should('have.attr', 'href').and('include', '.pdf');
    return this;
  }

  clickBreadCrumbHome() {
    cy.get(this.elements.breadCrumb, { timeout: Timeouts.EXTRA_LONG })
      .filter(':visible')
      .first()
      .should('be.visible')
      .click({ force: true });
    return this;
  }

  pegaUrlAtual() {
    cy.url().as('urlAntes');
    return this;
  }

  validaDirecionamentoClickBreadCrumb() {
    cy.url({ timeout: Timeouts.EXTRA_LONG }).should('not.include', '/sobre-o-portoplus');
    cy.location('pathname', { timeout: Timeouts.EXTRA_LONG }).should(
      'not.include',
      '/sobre-o-portoplus',
    );
    cy.get('@urlAntes').then((urlAntes) => {
      cy.url({ timeout: Timeouts.EXTRA_LONG }).then((urlDepois) => {
        expect(urlDepois).to.eq(urlAntes);
        expect(urlDepois).to.include('portoplus.com.br');
      });
    });
    return this;
  }
}

export default SobreOPortoPlusPage;
