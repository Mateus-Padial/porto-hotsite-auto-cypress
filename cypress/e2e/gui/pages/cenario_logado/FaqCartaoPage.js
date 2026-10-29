import BasePage from '../../base/BasePage.js';
import FaqCartaoElements from '../../elements/cenario_logado/FaqCartaoElements.js';
import Timeouts from '../../../../support/constants/Timeouts.js';

class FaqCartaoPage extends BasePage {
  constructor() {
    super();
    this.elements = new FaqCartaoElements();
  }

  verificarElementoFaqCartao(nomeElemento) {
    const mapaElementos = {
      Título: () => this.validateElementVisible(this.elements.txtTitulo, Timeouts.MEDIUM),
      'Campo pesquisa': () =>
        this.validateElementVisible(this.elements.inputSearch, Timeouts.MEDIUM),
    };

    if (mapaElementos[nomeElemento]) {
      mapaElementos[nomeElemento]();
    } else {
      throw new Error(`Elemento não encontrado: ${nomeElemento}`);
    }
    return this;
  }

  validaElementosPaginaFaqCartao(dataTable) {
    cy.wrap(dataTable.rawTable).each((linha) => {
      cy.wrap(linha).each((elemento) => {
        this.verificarElementoFaqCartao(elemento);
      });
    });
    return this;
  }
}

export default FaqCartaoPage;
