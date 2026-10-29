import BasePage from '../../base/BasePage.js';
import ProgramaAnteriorElements from '../../elements/cenario_logado/ProgramaAnteriorElements.js';
import Timeouts from '../../../../support/constants/Timeouts.js';

class ProgramaAnteriorPage extends BasePage {
  constructor() {
    super();
    this.elements = new ProgramaAnteriorElements();
  }

  verificarElementoProgramaAnterior(nomeElemento) {
    const mapaElementos = {
      Título: () => this.validateElementVisible(this.elements.txtTitulo, Timeouts.MEDIUM),
      Resgates: () => this.validateElementVisible(this.elements.btnResgates, Timeouts.MEDIUM),
      Pontuação: () => this.validateElementVisible(this.elements.btnPontuação, Timeouts.MEDIUM),
    };

    if (mapaElementos[nomeElemento]) {
      mapaElementos[nomeElemento]();
    } else {
      throw new Error(`Elemento não encontrado: ${nomeElemento}`);
    }
    return this;
  }

  validaElementosPaginaProgramaAnterior(dataTable) {
    cy.wrap(dataTable.rawTable).each((linha) => {
      cy.wrap(linha).each((elemento) => {
        this.verificarElementoProgramaAnterior(elemento);
      });
    });
    return this;
  }
}

export default ProgramaAnteriorPage;
