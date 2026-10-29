import '../authentication_sso/commands';
import { HOTSITE_ROUTES } from '../constants/routes';

const MARKETPLACE_ORIGIN = 'http://localhost';

// Mascara um documento (CPF/CNPJ) preservando apenas os 2 ultimos digitos,
// para evitar exposicao de PII em logs e relatorios publicados no CI.
function maskDocument(doc) {
  if (!doc) return '***';
  const str = String(doc);
  if (str.length <= 2) return '***';
  return `${'*'.repeat(str.length - 2)}${str.slice(-2)}`;
}

// Mascara um nome preservando o primeiro nome e apenas a inicial dos demais,
// mantendo legibilidade para debug sem expor o nome completo (PII) nos artefatos do CI.
function maskName(name) {
  if (!name) return '***';
  const partes = String(name).trim().split(/\s+/);
  if (partes.length === 1) return partes[0];
  const iniciais = partes
    .slice(1)
    .map((p) => `${p.charAt(0)}.`)
    .join(' ');
  return `${partes[0]} ${iniciais}`;
}

Cypress.Commands.add('loginComSSO', () => {
  const meuPortoUrl = Cypress.env('meu_porto_url') || Cypress.config('baseUrl');

  cy.session(
    'login-sso',
    () => {
      cy.visit(meuPortoUrl, { failOnStatusCode: false, timeout: 120000 });

      cy.getAccessToken().then((accessToken) => {
        cy.SSO(accessToken).then((authUrl) => {
          cy.visit(meuPortoUrl + authUrl, { failOnStatusCode: false, timeout: 120000 });

          cy.get('.nomeUsuario', { timeout: 15000 }).should('be.visible');
        });
      });
    },
    {
      validate() {
        cy.visit(meuPortoUrl, { failOnStatusCode: false, timeout: 120000 });
        cy.get('.nomeUsuario', { timeout: 10000 }).should('be.visible');
      },
    },
  );

  cy.visit(meuPortoUrl, { failOnStatusCode: false, timeout: 120000 });
});

Cypress.Commands.add('dispensarCookiesSeExistir', () => {
  cy.document().then((doc) => {
    const el = doc.querySelector('a.cc-btn.cc-dismiss');
    if (el) {
      cy.get('a.cc-btn.cc-dismiss').should('be.visible').click({ force: true });
    }
  });
});

Cypress.Commands.add('acessarMarketplaceViaSSO', () => {
  let userInfo;

  cy.get('@userInfo.all').then((calls) => {
    if (calls?.length > 0) {
      userInfo = calls[0].response.body[0];

      expect(userInfo.typePerson).to.eq('Fisica');
      expect(userInfo.isActiveProfile).to.be.true;

      // Nome e documento mascarados para nao expor PII nos relatorios/artefatos publicados no CI.
      const documentoMascarado = maskDocument(userInfo.document);
      cy.log(`Usuario: ${maskName(userInfo.name)} | Documento: ${documentoMascarado}`);
    }
  });

  cy.wait('@ssoMarketplace', { timeout: 30000 }).then((interception) => {
    const ssoUrl = interception.response.body;
    expect(ssoUrl).to.include('jwt=');

    const url = new URL(ssoUrl);
    const jwt = url.searchParams.get('jwt');
    expect(jwt, 'JWT ausente na URL de SSO').to.be.a('string').and.not.be.empty;
    const payload = JSON.parse(atob(jwt.split('.')[1]));

    if (userInfo) {
      expect(payload.sub).to.equal(userInfo.document);
    }

    expect(payload.aud).to.include('');

    cy.log('JWT validado com sucesso');

    const rawDestino = payload.returnUrl || payload.aud;
    let destinoFinal = MARKETPLACE_ORIGIN;

    if (typeof rawDestino === 'string' && rawDestino.trim()) {
      const cleanedDestino = rawDestino.trim();

      if (/^https?:\/\//i.test(cleanedDestino)) {
        destinoFinal = cleanedDestino;
      } else if (cleanedDestino.startsWith('/')) {
        destinoFinal = `${MARKETPLACE_ORIGIN}${cleanedDestino}`;
      } else {
        destinoFinal = `${MARKETPLACE_ORIGIN}/${cleanedDestino}`;
      }
    }

    cy.origin(MARKETPLACE_ORIGIN, { args: { destinoFinal } }, ({ destinoFinal }) => {
      Cypress.on('uncaught:exception', () => false);

      cy.visit(destinoFinal, {
        failOnStatusCode: false,
        timeout: 120000,
        retryOnNetworkFailure: true,
      });

      cy.location('hostname', { timeout: 120000 }).should('include', 'localhost');

      cy.get('body', { timeout: 120000 }).should('be.visible');
    });
  });

  cy.screenshot('acesso_ao_catalogo_PF');
});

// Gera a URL de SSO do marketplace direto via cy.request (sem clicar em "Trocar Pontos"
// e sem login no browser) e visita o catalogo. A validacao do redirect fica no comando
// validarAcessoCatalogo, para respeitar a separacao When/Then dos cenarios.
Cypress.Commands.add('acessarCatalogoViaUrlSSO', () => {
  const baseUrl = Cypress.config('baseUrl') || Cypress.env('base_url');

  cy.getAccessToken().then((accessToken) => {
    const key_sso = Cypress.env('key_sso');
    const DEBUG = Cypress.env('DEBUG');

    cy.request({
      method: 'POST',
      url: `${baseUrl}${HOTSITE_ROUTES.SESSION_MARKETPLACE}`,
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': key_sso,
        Authorization: `Bearer ${accessToken}`,
      },
      body: { path: '' },
      log: false,
      failOnStatusCode: false,
    }).then((response) => {
      if (DEBUG === 'true') {
        // Nao logar o body: a resposta e a URL de SSO contendo o JWT (jwt=...) na query string.
        const tamanho =
          typeof response.body === 'string'
            ? response.body.length
            : JSON.stringify(response.body || {}).length;
        console.log(
          'session-marketplace response status:',
          response.status,
          '| tamanho do corpo:',
          tamanho,
        );
      }

      expect(response.status, 'status do session-marketplace').to.eq(200);

      // A resposta pode ser a URL pura (string) ou um objeto contendo a URL.
      const ssoUrl =
        typeof response.body === 'string'
          ? response.body
          : response.body?.url || response.body?.authorizationUrl;

      expect(ssoUrl, 'URL de SSO do marketplace').to.be.a('string').and.to.include('jwt=');

      cy.origin(MARKETPLACE_ORIGIN, { args: { ssoUrl } }, ({ ssoUrl }) => {
        Cypress.on('uncaught:exception', () => false);

        cy.visit(ssoUrl, {
          failOnStatusCode: false,
          timeout: 120000,
          retryOnNetworkFailure: true,
        });

        cy.get('body', { timeout: 120000 }).should('be.visible');
      });
    });
  });
});

// Valida que, apos o acesso direto, o browser esta no catalogo (marketplace).
Cypress.Commands.add('validarAcessoCatalogo', () => {
  cy.origin(MARKETPLACE_ORIGIN, () => {
    cy.location('hostname', { timeout: 120000 }).should('include', 'localhost');
  });

  cy.screenshot('acesso_ao_catalogo_PF_via_url');
});

// Aguarda a página do catálogo estabilizar e fecha o modal da jornada guiada se aparecer.
// Estrutura Ant Design do botão de fechar:
//   <button class="ant-modal-close">        ← elemento clicável
//     <span class="ant-modal-close-x">      ← apenas o ícone (não clicável diretamente)
// Estratégia:
//   1. Aguarda body visível e spinners sumirem
//   2. Espera 4s para o modal aparecer de forma assíncrona (React)
//   3. Se modal visível: clica no button.ant-modal-close (pai do span X)
//   4. Aguarda modal sumir
Cypress.Commands.add('dispensarModalJornadaSeVisivel', () => {
  cy.origin(MARKETPLACE_ORIGIN, () => {
    Cypress.on('uncaught:exception', () => false);

    const MODAL = '#tourHomeModal';
    // button.ant-modal-close é o elemento clicável real — não o span.ant-modal-close-x
    const FECHAR = 'button.ant-modal-close';
    // Spinner ATIVO do Ant Design — .ant-spin-spinning (não o wrapper .ant-spin-nested-loading que sempre existe)
    const LOADER = '.ant-spin-spinning';

    cy.get('body').should('be.visible');

    // Aguarda spinner ativo sumir se existir
    cy.get('body').then(($body) => {
      if ($body.find(LOADER).length) {
        cy.get(LOADER, { timeout: 10000 }).should('not.exist');
      }
    });

    // Espera curta para o modal aparecer de forma assíncrona (React).
    // Valor menor que os 4s originais para não degradar a performance em headless.
    cy.wait(2000);

    // Fecha o modal se estiver visível
    cy.get('body').then(($body) => {
      const $modal = $body.find(MODAL);

      if ($modal.length && $modal.is(':visible')) {
        cy.log('Modal da jornada guiada detectado — fechando...');

        const $btnFechar = $body.find(FECHAR);
        if ($btnFechar.length) {
          cy.wrap($btnFechar.first()).click({ force: true });
        } else {
          cy.get(MODAL).find('button').first().click({ force: true });
        }

        // Aguarda o modal sumir — aceita tanto removido do DOM quanto apenas oculto
        cy.get('body').then(($b) => {
          if ($b.find(MODAL).length) {
            cy.get(MODAL, { timeout: 8000 }).should('not.be.visible');
          }
        });
        cy.log('Modal fechado com sucesso.');
      } else {
        cy.log('Modal não encontrado ou já oculto — seguindo normalmente.');
      }
    });
  });
});
