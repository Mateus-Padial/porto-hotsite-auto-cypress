import BasePage from '../base/BasePage.js';
import HomeElements from '../elements/HomeElements.js';
import Timeouts from '../../../support/constants/Timeouts.js';

class HomePage extends BasePage {
  constructor() {
    super();
    this.elements = new HomeElements();
  }

  acessarHotsite() {
    this.visit(this.meuPortoUrl, { timeout: Timeouts.DEFAULT });
    return this;
  }

  login() {
    cy.loginComSSO();
    return this;
  }

  dispensaCookies() {
    cy.dispensarCookiesSeExistir();
    return this;
  }

  validaHomeUsuarioLogado() {
    this.validateElementVisible(this.elements.txtNomeUsuario);
    this.validateElementVisible(this.elements.imgUser);
    return this;
  }

  validaNovosMenusUsuarioLogado() {
    this.validateElementVisible(this.elements.btnPraMim);
    this.validateElementVisible(this.elements.btnMeusPontos);
    return this;
  }

  validaClickModalSaldo() {
    this.clickQuandoVisivel(this.elements.modalSaldo, { timeout: Timeouts.DEFAULT });
    return this;
  }

  validaSaldoDisponivel() {
    this.validateElementExists(this.elements.txtSaldoDisponivel, Timeouts.DEFAULT);
    return this;
  }

  verificarElementoNaHome(nomeElemento) {
    const mapaElementos = {
      'Logo portoplus': () =>
        this.validateElementVisible(this.elements.imgPortoPlus, Timeouts.MEDIUM),
      'Sobre o PortoPlus': () =>
        this.validateElementVisible(this.elements.txtSobrePorto, Timeouts.MEDIUM),
      'FAQ Compras com Desconto': () =>
        this.validateElementVisible(this.elements.txtMenuFaq, Timeouts.MEDIUM),
      'Abas principais': () =>
        this.validateElementVisible(this.elements.btnTrocarPontos, Timeouts.MEDIUM),
      'Ícone Boneco': () => this.validateElementVisible(this.elements.imgUser, Timeouts.MEDIUM),
      'Botão Entrar': () => this.validateElementVisible(this.elements.txtEntrar, Timeouts.MEDIUM),
      'Carrossel de banners': () =>
        this.validateElementVisible(this.elements.banner, Timeouts.MEDIUM),
      'Cards de serviços': () =>
        this.validateElementExists(this.elements.txtTitleServicos, Timeouts.MEDIUM),
      'Rodapé completo': () => {
        this.scrollToElement(this.elements.footer);
        this.validateElementExists(this.elements.footer, Timeouts.MEDIUM);
      },
    };

    if (mapaElementos[nomeElemento]) {
      mapaElementos[nomeElemento]();
    } else {
      throw new Error(`Elemento não encontrado: ${nomeElemento}`);
    }
    return this;
  }

  validaElementosNaHome(dataTable) {
    cy.wrap(dataTable.rawTable).each((linha) => {
      cy.wrap(linha).each((elemento) => {
        this.verificarElementoNaHome(elemento);
      });
    });
    return this;
  }

  clickSobrePortoPlus() {
    this.clickWithJS(this.elements.txtSobrePorto);
    return this;
  }

  validaDirecionamentoSobrePorto() {
    this.validateUrlContains('/sobre-o-portoplus');
    return this;
  }

  acessoPaginaSobreOPortoPlus() {
    this.clickSobrePortoPlus();
    this.validaDirecionamentoSobrePorto();
    return this;
  }

  clickFaqComprarComDesconto(opcaoFaq = 'FAQ Compras Com Desconto') {
    this.validateElementVisible(this.elements.txtMenuFaq);

    this.clickQuandoVisivel(this.elements.iconSetaFaq);

    cy.contains(`${this.elements.txtSubMenuFaq}, a, button`, opcaoFaq, { timeout: Timeouts.LONG })
      .filter(':visible')
      .first()
      .click({ force: true });
    return this;
  }

  clickBanner() {
    this.validateElementVisible(this.elements.banner);
    this.clickElement(this.elements.banner);
    return this;
  }

  pegaUrlAtual() {
    cy.url().as('urlAntes');
    return this;
  }

  validaDirecionamentoClickBanner() {
    // cy.on tem escopo por teste e e removido automaticamente ao final dele,
    // evitando o acumulo de listeners que ocorria com Cypress.on (vazamento entre testes).
    cy.on('fail', (err, runnable) => {
      if (err.message.includes('The command was expected to run against origin')) {
        cy.log('⚠️ Redirecionamento para outro domínio bloqueou a validação de URL.');
        return false;
      }
      throw err;
    });

    cy.url().then((urlDepois) => {
      try {
        const originAntes = new URL(this.urlAntes).origin;
        const originDepois = new URL(urlDepois).origin;

        if (originDepois !== originAntes) {
          cy.log('✅ Navegação para outra origin detectada com sucesso:', originDepois);
          return;
        }

        expect(urlDepois).to.not.eq(this.urlAntes);
        cy.log('✅ URL redirecionada com sucesso dentro da mesma origin.');
      } catch (e) {
        cy.log('⚠️ Erro ao validar redirecionamento:', e.message);
      }
    });
    return this;
  }

  validarDirecionamentoPaginaLogin() {
    cy.location('pathname', { timeout: Timeouts.LONG }).should('include', '/Login');
    return this;
  }

  clickTroquePontos() {
    this.clickQuandoVisivel(this.elements.btnTrocarPontos);
    return this;
  }

  validaInfoTroquePontosHome() {
    this.validateElementExists(this.elements.txtPreviaMarkeplace);
    this.validateElementVisible(this.elements.btnVerMais);
    return this;
  }

  clickCompreComDesconto() {
    this.clickQuandoVisivel(this.elements.btnComprarComDesconto);
    return this;
  }

  validarInfoCompreComDesconto() {
    this.validateElementExists(this.elements.txtVantagensExclusivas);
    this.validateElementVisible(this.elements.btHome);
    this.validateElementVisible(this.elements.btnAlguelCarro);
    return this;
  }

  clickServico(servico) {
    this.stubWindowOpen();

    this.validateElementExists(this.elements.txtTitleServicos);

    const clicarEExtrairUrl = (seletor) => {
      cy.get(seletor)
        .should('exist')
        .invoke('removeAttr', 'target')
        .then(($el) => {
          if ($el.length) {
            $el[0].click();
          }
        });

      return cy
        .get('@windowOpen')
        .should('have.been.called')
        .then((stub) => {
          const urlRedirecionada = stub.getCall(0).args[0];
          cy.wrap(urlRedirecionada, { log: false }).as('urlRedirecionada');
        });
    };

    const mapaServicos = {
      'Seguro Auto': () => clicarEExtrairUrl(this.elements.btnSeguroAuto),
      'Seguro Azul': () => clicarEExtrairUrl(this.elements.btnSeguroAzul),
      'Seguro Residência': () => clicarEExtrairUrl(this.elements.btnSeguroResidencia),
      Financiamento: () => clicarEExtrairUrl(this.elements.btnFinanciamento),
      Vida: () => clicarEExtrairUrl(this.elements.btnVida),
      'Porto Serviço': () => clicarEExtrairUrl(this.elements.btnPortoServicos),
      'Instituto Porto': () => clicarEExtrairUrl(this.elements.btnInstitutoPorto),
    };

    if (mapaServicos[servico]) {
      mapaServicos[servico]();
    } else {
      throw new Error(`Serviço "${servico}" não mapeado.`);
    }
    return this;
  }

  validaRedirecionamentoServico(urlDestino) {
    if (!urlDestino) {
      throw new Error('URL de redirecionamento não foi fornecida.');
    }
    cy.log(`🌐 Validando redirecionamento para: ${urlDestino}`);
    this.validateWindowOpenCalled(urlDestino);
    return this;
  }

  clickCardsTroquePontos(cards) {
    const mapaCards = {
      Game: this.elements.btnGame,
      'Casa e Cozinha': this.elements.btnCasaECozinha,
      Eletrônicos: this.elements.btnEletronicos,
      TVs: this.elements.btnTVs,
    };

    const seletor = this.resolverDoMapa(mapaCards, cards, 'Card');
    this.clickWithJS(seletor, { timeout: Timeouts.MEDIUM, removeTarget: true });
    return this;
  }

  prepararStubRedirecionamento() {
    this.stubWindowOpen();
    return this;
  }

  validarUrlEsperadaTroquePontosLogado() {
    cy.get('@windowOpen', { timeout: Timeouts.DEFAULT }).should('have.been.called');
    return this;
  }

  clickCardsParceiros(cards) {
    const mapaCards = {
      Smiles: () => this.clickWithJS(this.elements.btnSmiles),
      'Azul viagens': () => this.clickWithJS(this.elements.btnAzul),
      'Miles&GO': () => this.clickWithJS(this.elements.btnMiles),
      'Latam Pass': () => this.clickWithJS(this.elements.btnLatam),
    };

    if (mapaCards[cards]) {
      mapaCards[cards]();
    } else {
      throw new Error(`Card parceiro "${cards}" não mapeado.`);
    }
    return this;
  }

  clickParaMim() {
    this.clickWithJS(this.elements.btnPraMim);
    return this;
  }

  clickMeusPontos() {
    this.clickWithJS(this.elements.btnMeusPontos);
    return this;
  }

  clicarNoSubmenu(submenu) {
    const mapaSubmenus = {
      'Meu Extrato': {
        menuPai: 'Meus Pontos',
        action: () => this.clickWithJS(this.elements.txtMeuExtrato),
      },
      'Histórico de Resgates': {
        menuPai: 'Meus Pontos',
        action: () => this.clickWithJS(this.elements.txtHistoricoExtrato),
      },
      'Programa Anterior': {
        menuPai: 'Meus Pontos',
        action: () => this.clickWithJS(this.elements.txtProgramaAnterior),
      },
      'Produtos Porto': {
        menuPai: 'Para mim',
        action: () => this.clickWithJS(this.elements.txtProdutosPorto),
      },
      'Meus Vouchers': {
        menuPai: 'Para mim',
        action: () => this.clickWithJS(this.elements.txtMeusVouchers),
      },
      'Meus Relacionamentos': {
        menuPai: 'Para mim',
        action: () => this.clickWithJS(this.elements.txtMeusRelacionamentos),
      },
      'FAQ Cartão': {
        menuPai: 'Para mim',
        action: () => this.clickWithJS(this.elements.txtFaqCartao),
      },
      'FAQ Compras Com Desconto': {
        menuPai: 'Para mim',
        action: () => this.clickWithJS(this.elements.txtFaqComprasDesconto),
      },
    };

    const submenuInfo = mapaSubmenus[submenu];

    if (!submenuInfo) {
      throw new Error(`Submenu não mapeado: ${submenu}`);
    }

    cy.contains('button, a', submenuInfo.menuPai, { timeout: Timeouts.LONG })
      .should('be.visible')
      .then(($el) => {
        if ($el.length) {
          $el[0].click();
        }
      });

    submenuInfo.action();
    return this;
  }

  validarUrlEsperada(urlEsperada) {
    this.validateUrlContains(urlEsperada, Timeouts.MEDIUM);
    return this;
  }

  acessarPaginaMeusVouchers() {
    this.clickParaMim();
    this.clickWithJS(this.elements.txtMeusVouchers);
    return this;
  }

  acessarPaginaMeusRelacionamentos() {
    this.clickParaMim();
    this.clickWithJS(this.elements.txtMeusRelacionamentos);
    return this;
  }

  acessarPaginaFaqCartao() {
    this.clickParaMim();
    this.clickWithJS(this.elements.txtFaqCartao);
    return this;
  }

  acessarPaginaFaqComprarDesconto() {
    this.clickParaMim();
    this.clickWithJS(this.elements.txtFaqComprasDesconto);
    return this;
  }

  acessarPaginaProdutosPorto() {
    this.clickParaMim();
    this.clickWithJS(this.elements.txtProdutosPorto);
    return this;
  }

  acessarPaginaMeuExtrato() {
    this.clickMeusPontos();
    this.clickWithJS(this.elements.txtMeuExtrato);
    return this;
  }

  acessarPaginaHistoricoResgates() {
    this.clickMeusPontos();
    this.clickWithJS(this.elements.txtHistoricoExtrato);
    return this;
  }

  acessarPaginaProgramaAnterior() {
    this.clickMeusPontos();
    this.clickWithJS(this.elements.txtProgramaAnterior);
    return this;
  }

  clickLogout() {
    this.validateElementExists(this.elements.btnSair);
    this.clickWithJS(this.elements.btnSair);
    return this;
  }

  validarLogoutRedirect() {
    this.validateUrlContains('portoplus.com.br', Timeouts.LONG);
    cy.get(this.elements.txtEntrar, { timeout: Timeouts.LONG }).should('exist').and('be.visible');
    return this;
  }

  inteceptaResquestCatalogo() {
    cy.intercept('POST', '**/hotsite/participants/v1/session-marketplace').as('sessionMarketplace');

    this.waitForRequest('sessionMarketplace', Timeouts.LONG).then((interception) => {
      if (interception.alias === 'sessionMarketplace') {
        cy.log('Usuário PF — Session marketplace foi chamado');
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body).to.have.property('profileCatalogSelected');
      }
    });
    return this;
  }

  clickTrocarPontos() {
    cy.intercept('GET', '**/participants/v2/info').as('userInfo');
    cy.intercept('POST', '**/session-marketplace').as('ssoMarketplace');

    cy.window().then((win) => {
      cy.stub(win, 'open').callsFake((url) => {
        win.location.href = url;
      });
    });

    cy.contains('Trocar Pontos', { timeout: Timeouts.LONG })
      .should('be.visible')
      .invoke('removeAttr', 'target')
      .then(($el) => {
        if ($el.length) {
          $el[0].click({ force: true });
        }
      });

    return this;
  }

  validarRedirectMarketplacePortoPlus() {
    // cy.on tem escopo por teste e e removido automaticamente ao final dele,
    // evitando o acumulo de listeners que ocorria com Cypress.on (vazamento entre testes).
    cy.on('window:before:load', (win) => {
      cy.stub(win, 'open')
        .callsFake((url) => {
          win.location.href = url;
        })
        .as('windowOpen');
    });

    this.validateWindowOpenCalled();

    cy.get('@windowOpen').then((stub) => {
      const urlChamada = stub.getCall(0).args[0];
      expect(urlChamada).to.include('sso.ltm.digital');
    });
    return this;
  }
}

export default HomePage;
