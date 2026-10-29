import BasePage from '../../base/BasePage.js';
import MeuExtratoElements from '../../elements/cenario_logado/MeuExtratoElements.js';
import Timeouts from '../../../../support/constants/Timeouts.js';

class MeuExtratoPage extends BasePage {
  constructor() {
    super();
    this.elements = new MeuExtratoElements();
  }

  verificarElementoMeuExtrato(nomeElemento) {
    const mapaElementos = {
      Título: () => this.validateElementVisible(this.elements.txtTitulo, Timeouts.MEDIUM),
      'Menu lateral': () => this.validateElementVisible(this.elements.menuLateral, Timeouts.MEDIUM),
      Saldo: () => this.validateElementVisible(this.elements.txtSaldo, Timeouts.MEDIUM),
      Histórico: () => this.validateElementVisible(this.elements.txtHistorico, Timeouts.MEDIUM),
      'Detalhe dos pontos': () =>
        this.validateElementVisible(this.elements.btnDetalhePontos, Timeouts.MEDIUM),
      'Pontos a expirar': () =>
        this.validateElementVisible(this.elements.btnPontosExpirar, Timeouts.MEDIUM),
    };

    if (mapaElementos[nomeElemento]) {
      mapaElementos[nomeElemento]();
    } else {
      throw new Error(`Elemento não encontrado: ${nomeElemento}`);
    }
    return this;
  }

  validaElementosPaginaMeuExtrato(dataTable) {
    cy.wrap(dataTable.rawTable).each((linha) => {
      cy.wrap(linha).each((elemento) => {
        this.verificarElementoMeuExtrato(elemento);
      });
    });
    return this;
  }
}

export default MeuExtratoPage;
