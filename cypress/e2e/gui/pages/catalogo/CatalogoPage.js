import BasePage from '../../base/BasePage.js';
import CatalogoElements from '../../elements/catalogo/CatalogoElements.js';
import Timeouts from '../../../../support/constants/Timeouts.js';

const MARKETPLACE_ORIGIN = 'http://localhost';

// Valores literais para uso dentro de cy.origin() — imports não funcionam lá dentro.
const T_LONG = 15000;
const T_EXTRA_LONG = 20000;
const T_PAGE_LOAD = 120000;
const T_MODAL_ESPERA = 4000; // tempo máximo para aguardar o modal aparecer após carregamento

// Seletores do modal — centralizados aqui para não depender de imports dentro de cy.origin()
const MODAL_SEL = '#tourHomeModal';
const FECHAR_SEL = '.ant-modal-close-x';

// ─── Helper: aguarda página carregar e fecha o modal da jornada se aparecer ──────
// Deve ser chamado DENTRO de um bloco cy.origin() — não funciona fora.
// Estratégia:
//   1. Aguarda o loader/spinner sumir (indica que o React terminou de renderizar)
//   2. Espera um tempo fixo para o modal ter chance de aparecer
//   3. Se o modal estiver visível, fecha; se não, segue
function aguardarPaginaEDispensar(modalSel, fecharSel, tempoEspera) {
  // Aguarda o network quietar e o DOM estabilizar
  cy.get('body').should('be.visible');

  // Aguarda spinner/loader sumir caso exista
  cy.get('body').then(($body) => {
    if ($body.find('.ant-spin-spinning, [class*="loading"], [class*="spinner"]').length) {
      cy.get('.ant-spin-spinning, [class*="loading"], [class*="spinner"]', {
        timeout: 10000,
      }).should('not.exist');
    }
  });

  // Dá tempo para o modal aparecer de forma assíncrona após o carregamento
  cy.wait(tempoEspera);

  // Verifica e fecha o modal
  cy.get('body').then(($body) => {
    if ($body.find(modalSel).length && $body.find(modalSel).is(':visible')) {
      cy.log('Modal da jornada guiada detectado — dispensando...');
      cy.get(modalSel).within(() => {
        cy.contains('button', /ver mais tarde|agora não|fechar|close/i).then(($btn) => {
          if ($btn.length) {
            cy.wrap($btn).click();
          } else {
            cy.get(fecharSel).first().click();
          }
        });
      });
      cy.get(modalSel, { timeout: 5000 }).should('not.be.visible');
      cy.log('Modal dispensado — tela limpa para o teste.');
    } else {
      cy.log('Modal não apareceu — seguindo normalmente.');
    }
  });
}

class CatalogoPage extends BasePage {
  constructor() {
    super();
    this.elements = new CatalogoElements();
  }

  // ─── ACESSO VIA SSO ──────────────────────────────────────────────────────────

  acessarCatalogoViaUrlSSO() {
    cy.acessarCatalogoViaUrlSSO();
    return this;
  }

  validarAcessoCatalogo() {
    cy.validarAcessoCatalogo();
    return this;
  }

  // ─── JORNADA GUIADA (CT02) ───────────────────────────────────────────────────

  aguardarCatalogoCarregar() {
    cy.log('Aguardando carregamento do catálogo...');
    this.validateUrlContains('localhost', Timeouts.EXTRA_LONG);
    cy.contains('Quero fazer uma visita guiada', { timeout: Timeouts.EXTRA_LONG }).should(
      'be.visible',
    );
    return this;
  }

  concluirJornadaGuiada() {
    this.aguardarCatalogoCarregar();

    cy.get('body').then(($body) => {
      if ($body.find(this.elements.modalJornada).length) {
        cy.log('Jornada guiada detectada');
        cy.contains(this.elements.btnVisitaGuiada, 'Quero fazer uma visita guiada')
          .should('be.visible')
          .click();
        this.percorrerTour();
      } else {
        cy.log('Jornada não exibida — pulando tour.');
      }
    });

    return this;
  }

  percorrerTour() {
    this.validateElementVisible(this.elements.tourStep1);
    cy.get(this.elements.txtTourTituloPrimeiro).should('contain', 'Encontre prêmios e serviços');
    cy.get(this.elements.btnTourProximo).click();

    const steps = [
      this.elements.tourStep2,
      this.elements.tourStep3,
      this.elements.tourStep4,
      this.elements.tourStep5,
      this.elements.tourStep6,
      this.elements.tourStep7,
    ];

    steps.forEach((step) => {
      this.validateElementVisible(step);
      cy.get(this.elements.btnTourProximo).click();
    });

    cy.contains('Sim, finalizar').should('be.visible').click();
    cy.log('Jornada finalizada com sucesso');
    return this;
  }

  fecharTourGuiado() {
    const startedAt = Date.now();
    const timeoutMs = 4000;
    const checkIntervalMs = 250;

    const waitForModal = () => {
      const $modal = Cypress.$(this.elements.modalJornada);
      const modalVisivel = $modal.length > 0 && $modal.is(':visible');

      if (modalVisivel) {
        cy.log(`Modal ${this.elements.modalJornada} exibido. Fechando tour.`);
        return cy
          .get(this.elements.btnFecharTour, { timeout: Timeouts.LONG })
          .should('be.visible')
          .click();
      }

      if (Date.now() - startedAt >= timeoutMs) {
        cy.log(`Modal não apareceu em ${timeoutMs}ms. Seguindo sem fechar tour.`);
        return cy.wrap(null, { log: false });
      }

      return cy.wait(checkIntervalMs, { log: false }).then(() => waitForModal());
    };

    cy.then(() => waitForModal());
    return this;
  }

  // ─── VITRINE E PRODUTO (CT03) ────────────────────────────────────────────────

  selecionarProdutoVitrine() {
    cy.dispensarModalJornadaSeVisivel();

    cy.origin(MARKETPLACE_ORIGIN, { args: { timeout: T_PAGE_LOAD } }, ({ timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.visit('http://localhost/product/', {
        failOnStatusCode: false,
        timeout,
      });
    });
    return this;
  }

  adicionarAoCarrinho() {
    cy.origin(MARKETPLACE_ORIGIN, { args: { timeout: T_LONG } }, ({ timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.contains('button', 'Adicionar ao carrinho', { timeout }).should('be.visible').click();
    });
    return this;
  }

  validarProdutoNoCarrinho() {
    const cartSel = this.elements.cartItems;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { cartSel, timeout: T_LONG } },
      ({ cartSel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);
        cy.visit('http://localhost/cart', { failOnStatusCode: false, timeout });
        cy.get(cartSel, { timeout }).should('be.visible');
      },
    );
    cy.screenshot('produto_no_carrinho');
    return this;
  }

  // ─── FAVORITOS (CT04) ────────────────────────────────────────────────────────

  marcarProdutoComoFavorito() {
    cy.dispensarModalJornadaSeVisivel();

    const btnFav = this.elements.btnFavorito; // "Adicionar aos favoritos"
    const btnFavAtivo = this.elements.btnFavoritoAtivo; // "Remover dos favoritos" — já favoritado
    const itemFav = this.elements.itemFavorito;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { btnFav, btnFavAtivo, itemFav, timeout: T_LONG } },
      ({ btnFav, btnFavAtivo, itemFav, timeout }) => {
        Cypress.on('uncaught:exception', () => false);

        cy.get('body').then(($body) => {
          if ($body.find(btnFav).length) {
            // Botão "Adicionar aos favoritos" encontrado — clica e segue o fluxo normal
            cy.log('Botão de favorito encontrado — adicionando aos favoritos...');
            cy.get(btnFav, { timeout }).first().should('be.visible').click();
          } else {
            // Produto já foi favoritado anteriormente — vai direto para a wishlist validar
            cy.log(
              'Botão de favorito não encontrado — produto já favoritado. Validando wishlist...',
            );
            cy.visit('http://localhost/wishlist', {
              failOnStatusCode: false,
              timeout,
            });
            cy.get(itemFav, { timeout }).should('have.length.at.least', 1);
          }
        });
      },
    );
    return this;
  }

  validarProdutoNaListaDeFavoritos() {
    const itemFav = this.elements.itemFavorito;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { itemFav, timeout: T_LONG } },
      ({ itemFav, timeout }) => {
        Cypress.on('uncaught:exception', () => false);

        // Garante que está na wishlist — se já estiver lá (redirecionado pelo step anterior), não re-visita
        cy.location('pathname').then((path) => {
          if (!path.includes('wishlist')) {
            cy.visit('http://localhost/wishlist', {
              failOnStatusCode: false,
              timeout,
            });
          }
        });

        cy.get(itemFav, { timeout }).should('have.length.at.least', 1);
      },
    );
    cy.screenshot('produto_favoritado');
    return this;
  }

  // ─── BUSCA (CT05) ────────────────────────────────────────────────────────────

  digitarNaBusca(termo) {
    cy.dispensarModalJornadaSeVisivel();

    const inputSel = this.elements.inputBusca;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { inputSel, termo, timeout: T_LONG } },
      ({ inputSel, termo, timeout }) => {
        Cypress.on('uncaught:exception', () => false);
        cy.get(inputSel, { timeout }).first().should('be.visible').clear().type(termo);
      },
    );
    return this;
  }

  confirmarBusca() {
    // Dispensa o modal novamente — ele pode reaparecer entre os cy.origin do digitar e confirmar
    cy.dispensarModalJornadaSeVisivel();

    const btnSel = this.elements.btnBuscar;
    const inputSel = this.elements.inputBusca;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { btnSel, inputSel, timeout: T_LONG } },
      ({ btnSel, inputSel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);
        cy.get('body').then(($body) => {
          if ($body.find(btnSel).length) {
            cy.get(btnSel, { timeout }).click({ force: true });
          } else {
            // force:true ignora se o modal ainda estiver cobrindo o input
            cy.get(inputSel, { timeout }).first().type('{enter}', { force: true });
          }
        });
      },
    );
    return this;
  }

  validarResultadosBusca(termo) {
    const resultSel = this.elements.resultadosBusca;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { resultSel, timeout: T_LONG } },
      ({ resultSel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);
        cy.get(resultSel, { timeout }).should('have.length.at.least', 1);
      },
    );
    cy.screenshot(`busca_resultados_${termo.toLowerCase()}`);
    return this;
  }

  // ─── SALDO DE PONTOS (CT06) ──────────────────────────────────────────────────

  validarSaldoPontosVisivel() {
    cy.dispensarModalJornadaSeVisivel();

    const saldoSel = this.elements.saldoPontos;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { saldoSel, timeout: T_LONG } },
      ({ saldoSel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);
        // Aguarda visível E com texto numérico já carregado pelo React
        cy.get(saldoSel, { timeout })
          .first()
          .should('be.visible')
          .invoke('text')
          .should('match', /\d/);
      },
    );
    return this;
  }

  validarSaldoNumerico() {
    const saldoSel = this.elements.saldoPontos;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { saldoSel, timeout: T_LONG } },
      ({ saldoSel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);

        // Aguarda o elemento existir e o texto ser preenchido pelo React (não vazio e não só espaços)
        cy.get(saldoSel, { timeout })
          .first()
          .should('be.visible')
          .invoke('text')
          .should((texto) => {
            const numero = texto.trim().replace(/\D/g, '');
            expect(numero, `Saldo "${texto}" deve conter valor numérico`).to.match(/^\d+$/);
          });
      },
    );
    cy.screenshot('saldo_pontos');
    return this;
  }

  // ─── EXTRATO DE PONTOS (CT07) ────────────────────────────────────────────────

  acessarExtratoPontos() {
    cy.dispensarModalJornadaSeVisivel();

    const menuSel = this.elements.menuExtrato;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { menuSel, timeout: T_LONG } },
      ({ menuSel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);
        // Navega via link do menu ou diretamente pela URL
        cy.get('body').then(($body) => {
          if ($body.find(menuSel).length) {
            cy.get(menuSel, { timeout }).first().click();
          } else {
            cy.visit('http://localhost/extract', {
              failOnStatusCode: false,
              timeout,
            });
          }
        });
      },
    );
    return this;
  }

  validarExtratoVisivel() {
    const containerSel = this.elements.containerExtrato;
    const tituloSel = this.elements.tituloExtrato;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { containerSel, tituloSel, timeout: T_LONG } },
      ({ containerSel, tituloSel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);
        // Valida o container da página de extrato e o título "Extrato"
        cy.get(containerSel, { timeout }).should('be.visible');
        cy.get(tituloSel, { timeout }).should('be.visible').and('contain', 'Extrato');
      },
    );
    return this;
  }

  validarDadosMovimentacao() {
    const blocoSel = this.elements.blocoInfoExtrato;
    const valorSel = this.elements.valorInfoExtrato;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { blocoSel, valorSel, timeout: T_LONG } },
      ({ blocoSel, valorSel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);

        // Valida que os blocos de informação (disponível, total, etc.) estão presentes
        cy.get(blocoSel, { timeout }).should('have.length.at.least', 1);

        // Valida que cada bloco tem um valor de pontos com número válido
        cy.get(valorSel, { timeout })
          .first()
          .invoke('text')
          .then((texto) => {
            const numero = texto.replace(/\D/g, '');
            expect(numero, `Valor de pontos "${texto}" deve conter número`).to.match(/^\d+$/);
          });
      },
    );
    cy.screenshot('extrato_pontos');
    return this;
  }

  // ─── CATEGORIAS (CT08) ───────────────────────────────────────────────────────

  selecionarCategoria(categoria) {
    cy.dispensarModalJornadaSeVisivel();

    // Mapa nome → path da categoria (extraído dos hrefs reais do dropdown do catálogo).
    // O dropdown do Ant Design não abre via cy.trigger (eventos sintéticos) — navegar
    // direto pela URL é mais estável e rápido que simular hover/click.
    const CATEGORIAS_URL = {
      Automotivo: '/category/2/1',
      Bebês: '/category/3/1',
      'Bem estar': '/category/4',
      'Casa e cozinha': '/category/5/1',
      Eletrônicos: '/category/6/1',
      Gastronomia: '/category/13/1',
      'Indústria e Comércio': '/category/1/1',
      'Lazer e Cultura': '/category/7/1',
      Moda: '/category/8/1',
      Todos: '/search/1',
    };

    const path = CATEGORIAS_URL[categoria] || `/category/${categoria}`;

    cy.origin(MARKETPLACE_ORIGIN, { args: { path, timeout: T_LONG } }, ({ path, timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.visit(`http://localhost${path}`, {
        failOnStatusCode: false,
        timeout,
      });
    });
    return this;
  }

  validarProdutosVitrine() {
    const cardSel = this.elements.cardProduto;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { cardSel, timeout: T_LONG } },
      ({ cardSel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);
        cy.get(cardSel, { timeout }).should('have.length.at.least', 1);
      },
    );
    cy.screenshot('vitrine_categoria');
    return this;
  }

  // ─── PERFIL (CT09) ───────────────────────────────────────────────────────────

  acessarPerfil() {
    cy.dispensarModalJornadaSeVisivel();

    const menuSel = this.elements.menuPerfil;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { menuSel, timeout: T_LONG } },
      ({ menuSel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);
        cy.get('body').then(($body) => {
          if ($body.find(menuSel).length) {
            cy.get(menuSel, { timeout }).first().click();
          } else {
            cy.visit('http://localhost/profile', {
              failOnStatusCode: false,
              timeout,
            });
          }
        });
        // Aguarda o container principal da página de perfil carregar
        cy.get('.profile-page-content', { timeout }).should('be.visible');
      },
    );
    return this;
  }

  validarDadosPerfil() {
    const dadosSel = this.elements.dadosCadastrais; // .container-form-personal-data
    const formSel = this.elements.formDadosPessoais; // #FormsPersonalData
    const inputNome = this.elements.inputNome; // #FormsPersonalData_name
    const inputCpf = this.elements.inputCpf; // #FormsPersonalData_documentNumber
    const inputEmail = this.elements.inputEmail; // #FormsPersonalData_email

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { dadosSel, formSel, inputNome, inputCpf, inputEmail, timeout: T_LONG } },
      ({ dadosSel, formSel, inputNome, inputCpf, inputEmail, timeout }) => {
        Cypress.on('uncaught:exception', () => false);

        // Valida container de dados pessoais visível
        cy.get(dadosSel, { timeout }).should('be.visible');

        // Valida que o formulário existe
        cy.get(formSel, { timeout }).should('exist');

        // Valida que os campos principais têm valor preenchido
        cy.get(inputNome, { timeout }).should('have.attr', 'value').and('not.be.empty');
        cy.get(inputCpf, { timeout }).should('have.attr', 'value').and('not.be.empty');
        cy.get(inputEmail, { timeout }).should('have.attr', 'value').and('not.be.empty');
      },
    );
    return this;
  }

  validarNomeUsuarioPerfil() {
    const nomeSel = this.elements.inputNome; // #FormsPersonalData_name

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { nomeSel, timeout: T_LONG } },
      ({ nomeSel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);
        // O nome está no atributo value do input (disabled) — não no texto do elemento
        cy.get(nomeSel, { timeout })
          .should('have.attr', 'value')
          .and('match', /\S+/, 'Nome do usuário não deve estar vazio');
      },
    );
    cy.screenshot('perfil_usuario');
    return this;
  }

  // ─── VOUCHER (@skip) ─────────────────────────────────────────────────────────

  navegarParaVouchers() {
    cy.dispensarModalJornadaSeVisivel();

    cy.origin(MARKETPLACE_ORIGIN, { args: { timeout: T_LONG } }, ({ timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.contains('a', /voucher/i, { timeout }).click();
    });
    return this;
  }

  selecionarVoucher() {
    const cardSel = this.elements.cardProduto;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { cardSel, timeout: T_LONG } },
      ({ cardSel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);
        cy.get(cardSel, { timeout }).first().click();
      },
    );
    return this;
  }

  confirmarResgateVoucher() {
    cy.origin(MARKETPLACE_ORIGIN, { args: { timeout: T_LONG } }, ({ timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.contains('button', /resgatar|confirmar/i, { timeout }).click();
    });
    return this;
  }

  validarVoucherResgatado() {
    cy.origin(MARKETPLACE_ORIGIN, { args: { timeout: T_LONG } }, ({ timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.contains(/voucher resgatado|resgate confirmado|meus vouchers/i, { timeout }).should(
        'be.visible',
      );
    });
    cy.screenshot('voucher_resgatado');
    return this;
  }

  // ─── MILHAS (@skip) ──────────────────────────────────────────────────────────

  navegarParaMilhas() {
    cy.dispensarModalJornadaSeVisivel();

    cy.origin(MARKETPLACE_ORIGIN, { args: { timeout: T_LONG } }, ({ timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.contains('a', /milhas/i, { timeout }).click();
    });
    return this;
  }

  selecionarCompanhiaAerea() {
    const cardSel = this.elements.cardProduto;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { cardSel, timeout: T_LONG } },
      ({ cardSel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);
        cy.get(cardSel, { timeout }).first().click();
      },
    );
    return this;
  }

  confirmarTransferenciaMilhas() {
    cy.origin(MARKETPLACE_ORIGIN, { args: { timeout: T_LONG } }, ({ timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.contains('button', /transferir|confirmar/i, { timeout }).click();
    });
    return this;
  }

  validarTransferenciaMilhas() {
    cy.origin(MARKETPLACE_ORIGIN, { args: { timeout: T_LONG } }, ({ timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.contains(/transferência confirmada|milhas transferidas/i, { timeout }).should(
        'be.visible',
      );
    });
    cy.screenshot('milhas_transferidas');
    return this;
  }

  // ─── RECARGA (@skip) ─────────────────────────────────────────────────────────

  navegarParaRecargas() {
    cy.dispensarModalJornadaSeVisivel();

    cy.origin(MARKETPLACE_ORIGIN, { args: { timeout: T_LONG } }, ({ timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.contains('a', /recarga/i, { timeout }).click();
    });
    return this;
  }

  informarNumeroCelular() {
    cy.origin(MARKETPLACE_ORIGIN, { args: { timeout: T_LONG } }, ({ timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.get('input[type="tel"], input[placeholder*="celular"], input[placeholder*="telefone"]', {
        timeout,
      })
        .should('be.visible')
        .type('11999999999');
    });
    return this;
  }

  selecionarValorRecarga() {
    cy.origin(MARKETPLACE_ORIGIN, { args: { timeout: T_LONG } }, ({ timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.contains('button, label', /R\$|valor/i, { timeout })
        .first()
        .click();
    });
    return this;
  }

  confirmarRecarga() {
    cy.origin(MARKETPLACE_ORIGIN, { args: { timeout: T_LONG } }, ({ timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.contains('button', /recarregar|confirmar/i, { timeout }).click();
    });
    return this;
  }

  validarRecargaProcessada() {
    cy.origin(MARKETPLACE_ORIGIN, { args: { timeout: T_LONG } }, ({ timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.contains(/recarga realizada|recarga confirmada/i, { timeout }).should('be.visible');
    });
    cy.screenshot('recarga_processada');
    return this;
  }

  // ─── PARCEIRO BEFLY (@skip) ──────────────────────────────────────────────────

  acessarParceirosViagem() {
    cy.dispensarModalJornadaSeVisivel();

    const menuSel = this.elements.menuViagens;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { menuSel, timeout: T_LONG } },
      ({ menuSel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);
        cy.get('body').then(($body) => {
          if ($body.find(menuSel).length) {
            cy.get(menuSel, { timeout }).first().click();
          } else {
            cy.contains('a', /viagens|travel/i, { timeout })
              .first()
              .click();
          }
        });
      },
    );
    return this;
  }

  selecionarParceiroBefly() {
    const beflySel = this.elements.cardBeflyConecta;

    cy.origin(
      MARKETPLACE_ORIGIN,
      { args: { beflySel, timeout: T_LONG } },
      ({ beflySel, timeout }) => {
        Cypress.on('uncaught:exception', () => false);
        cy.get('body').then(($body) => {
          if ($body.find(beflySel).length) {
            cy.get(beflySel, { timeout }).first().click();
          } else {
            cy.contains(/befly/i, { timeout }).click();
          }
        });
      },
    );
    return this;
  }

  validarRedirecionamentoBefly() {
    cy.origin(MARKETPLACE_ORIGIN, { args: { timeout: T_LONG } }, ({ timeout }) => {
      Cypress.on('uncaught:exception', () => false);
      cy.url({ timeout }).should('match', /befly|conecta/i);
    });
    cy.screenshot('parceiro_befly_conecta');
    return this;
  }
}

export default CatalogoPage;
