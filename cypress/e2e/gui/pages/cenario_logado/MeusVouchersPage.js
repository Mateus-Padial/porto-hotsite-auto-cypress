import BasePage from '../../base/BasePage.js';
import MeusVouchersElements from '../../elements/cenario_logado/MeusVouchersElements.js';
import Timeouts from '../../../../support/constants/Timeouts.js';

class MeusVouchersPage extends BasePage {
  constructor() {
    super();
    this.elements = new MeusVouchersElements();
  }

  verificarElementoMeusVouchers(nomeElemento) {
    const mapaElementos = {
      Título: () => this.validateElementVisible(this.elements.txtTitulo, Timeouts.MEDIUM),
      'Menu lateral': () =>
        this.validateElementVisible(this.elements.modalMenuLateral, Timeouts.MEDIUM),
    };

    if (mapaElementos[nomeElemento]) {
      mapaElementos[nomeElemento]();
    } else {
      throw new Error(`Elemento não encontrado: ${nomeElemento}`);
    }
    return this;
  }

  validaElementosPaginaMeuVouchers(dataTable) {
    cy.wrap(dataTable.rawTable).each((linha) => {
      cy.wrap(linha).each((elemento) => {
        this.verificarElementoMeusVouchers(elemento);
      });
    });
    return this;
  }
}

export default MeusVouchersPage;
