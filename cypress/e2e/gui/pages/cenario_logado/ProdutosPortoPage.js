import BasePage from '../../base/BasePage.js';
import ProdutosPortoPlusElements from '../../elements/cenario_logado/ProdutosPortoPlusElements.js';
import Timeouts from '../../../../support/constants/Timeouts.js';

class ProdutosPortoPage extends BasePage {
  constructor() {
    super();
    this.elements = new ProdutosPortoPlusElements();
  }

  verificarElementoProdutosPorto(nomeElemento) {
    const mapaElementos = {
      Banner: () => this.validateElementVisible(this.elements.banner, Timeouts.MEDIUM),
      'Porto Seguro Auto': () =>
        this.validateElementVisible(this.elements.btnPortoSeguroAuto, Timeouts.MEDIUM),
      'Instituto Porto': () =>
        this.validateElementVisible(this.elements.btnInstitutoPorto, Timeouts.MEDIUM),
      'Seguro Residencial': () =>
        this.validateElementVisible(this.elements.btnSeguroResidencial, Timeouts.MEDIUM),
      'Centro Automotivo': () =>
        this.validateElementVisible(this.elements.btnCentroAutomotivo, Timeouts.MEDIUM),
      'Azul Seguro Auto': () =>
        this.validateElementVisible(this.elements.btnAzulSeguroAuto, Timeouts.MEDIUM),
      Financiamento: () =>
        this.validateElementVisible(this.elements.btnFinanciamento, Timeouts.MEDIUM),
      'Porto Faz': () => this.validateElementVisible(this.elements.btnPortoFaz, Timeouts.MEDIUM),
    };

    if (mapaElementos[nomeElemento]) {
      mapaElementos[nomeElemento]();
    } else {
      throw new Error(`Elemento não encontrado: ${nomeElemento}`);
    }
    return this;
  }

  validaElementosPaginaProdutosPorto(dataTable) {
    cy.wrap(dataTable.rawTable).each((linha) => {
      cy.wrap(linha).each((elemento) => {
        this.verificarElementoProdutosPorto(elemento);
      });
    });
    return this;
  }
}

export default ProdutosPortoPage;
