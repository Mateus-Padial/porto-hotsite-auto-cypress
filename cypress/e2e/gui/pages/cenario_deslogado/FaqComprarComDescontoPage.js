import BasePage from '../../base/BasePage.js';
import FaqCompraComDescontoElements from '../../elements/cenario_deslogado/FaqCompraComDescontoElements.js';
import Timeouts from '../../../../support/constants/Timeouts.js';

class FaqComprarComDescontoPage extends BasePage {
  constructor() {
    super();
    this.elements = new FaqCompraComDescontoElements();
  }

  verificarElementoFaqComprarDesconto(nomeElemento) {
    const mapaElementos = {
      Título: () => this.validateElementVisible(this.elements.txtFaqDesconto, Timeouts.MEDIUM),
      'Campo pesquisa': () =>
        this.validateElementVisible(this.elements.inputPesquisa, Timeouts.MEDIUM),
    };

    if (mapaElementos[nomeElemento]) {
      mapaElementos[nomeElemento]();
    } else {
      throw new Error(`Elemento não encontrado: ${nomeElemento}`);
    }
    return this;
  }

  validaElementosPaginaFaqComprarDesconto(dataTable) {
    cy.wrap(dataTable.rawTable).each((linha) => {
      cy.wrap(linha).each((elemento) => {
        this.verificarElementoFaqComprarDesconto(elemento);
      });
    });
    return this;
  }

  validarPaginaFaqComprarComDesconto() {
    cy.contains('h1, h2, [role="heading"]', /descontos/i, { timeout: Timeouts.LONG }).should(
      'be.visible',
    );
    this.validateElementVisible(this.elements.inputPesquisa, Timeouts.MEDIUM);
    return this;
  }
}

export default FaqComprarComDescontoPage;
