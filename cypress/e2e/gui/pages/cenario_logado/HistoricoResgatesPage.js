import BasePage from '../../base/BasePage.js';
import HistoricoResgatesElements from '../../elements/cenario_logado/HistoricoResgatesElements.js';
import Timeouts from '../../../../support/constants/Timeouts.js';

class HistoricoResgatesPage extends BasePage {
  constructor() {
    super();
    this.elements = new HistoricoResgatesElements();
  }

  verificarElementoHistoricoResgates(nomeElemento) {
    const mapaElementos = {
      Título: () => this.validateElementVisible(this.elements.txtTitulo, Timeouts.MEDIUM),
      'Menu lateral': () => this.validateElementVisible(this.elements.menuLateral, Timeouts.MEDIUM),
    };

    if (mapaElementos[nomeElemento]) {
      mapaElementos[nomeElemento]();
    } else {
      throw new Error(`Elemento não encontrado: ${nomeElemento}`);
    }
    return this;
  }

  validaElementosPaginaHistoricoResgates(dataTable) {
    cy.wrap(dataTable.rawTable).each((linha) => {
      cy.wrap(linha).each((elemento) => {
        this.verificarElementoHistoricoResgates(elemento);
      });
    });
    return this;
  }
}

export default HistoricoResgatesPage;
