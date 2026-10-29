import BasePage from '../../base/BasePage.js';
import MeusRelacionamentosElements from '../../elements/cenario_logado/MeusRelacionamentosElements.js';
import Timeouts from '../../../../support/constants/Timeouts.js';

class MeusRelacionamentosPage extends BasePage {
  constructor() {
    super();
    this.elements = new MeusRelacionamentosElements();
  }

  verificarElementoMeusRelacionamentos(nomeElemento) {
    const mapaElementos = {
      Título: () => this.validateElementVisible(this.elements.txtTitulo, Timeouts.MEDIUM),
      'Menu lateral': () =>
        this.validateElementVisible(this.elements.modalMenuLateral, Timeouts.MEDIUM),
      Duvida: () =>
        this.validateElementVisible(this.elements.txtDuvidaClienteCartao, Timeouts.MEDIUM),
    };

    if (mapaElementos[nomeElemento]) {
      mapaElementos[nomeElemento]();
    } else {
      throw new Error(`Elemento não encontrado: ${nomeElemento}`);
    }
    return this;
  }

  validaElementosPaginaMeusRelacionamentos(dataTable) {
    cy.wrap(dataTable.rawTable).each((linha) => {
      cy.wrap(linha).each((elemento) => {
        this.verificarElementoMeusRelacionamentos(elemento);
      });
    });
    return this;
  }
}

export default MeusRelacionamentosPage;
