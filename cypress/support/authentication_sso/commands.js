import { AUTH_ROUTES } from '../constants/routes';

// Mascara um token/segredo preservando apenas os primeiros e ultimos caracteres,
// suficiente para correlacionar em debug sem expor o valor completo nos logs do CI.
function maskToken(token) {
  if (!token) return '***';
  const str = String(token);
  if (str.length <= 12) return '***';
  return `${str.slice(0, 6)}...${str.slice(-4)} (len:${str.length})`;
}

Cypress.Commands.add('getAccessToken', () => {
  const baseUrl = Cypress.config('baseUrl') || Cypress.env('base_url');

  const auth_token = Cypress.env('auth_token');
  const subscription_key = Cypress.env('subscription_key');
  const cpf = Cypress.env('cpf');
  const DEBUG = Cypress.env('DEBUG');

  return cy
    .request({
      method: 'POST',
      url: `${baseUrl}${AUTH_ROUTES.TOKEN}`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/plain',
        'Ocp-Apim-Subscription-Key': subscription_key,
        Authorization: `Bearer ${auth_token}`,
      },
      body: {
        cpf,
        sourceSystem: 'Cartões',
      },
      log: false,
      failOnStatusCode: false,
    })
    .then((response) => {
      if (DEBUG === 'true') {
        console.log('Access token:', maskToken(response.body?.accessToken));
      }

      console.log(`Status recebido: ${response.status}`);

      if (response.status !== 200) {
        throw new Error(`Erro na requisição: status ${response.status}`);
      }

      const accessToken = response.body.accessToken;

      if (!accessToken) {
        throw new Error('AccessToken não encontrado na resposta');
      }

      return cy.wrap(accessToken, { log: false });
    });
});

Cypress.Commands.add('SSO', (accessToken) => {
  const baseUrl = Cypress.config('baseUrl') || Cypress.env('base_url');

  if (!accessToken) {
    throw new Error('AccessToken não informado para o comando SSO');
  }

  const key_sso = Cypress.env('key_sso');
  const DEBUG = Cypress.env('DEBUG');

  return cy
    .request({
      method: 'POST',
      url: `${baseUrl}${AUTH_ROUTES.SSO}`,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': key_sso,
        Authorization: `Bearer ${accessToken}`,
      },
      body: {},
      log: false,
      failOnStatusCode: false,
    })
    .then((response) => {
      if (DEBUG === 'true') {
        // Nao logar o body completo: authorizationUrl carrega JWT/segredo na query string.
        console.log(
          'SSO response status:',
          response.status,
          '| campos:',
          Object.keys(response.body || {}),
        );
      }

      if (response.status !== 200) {
        throw new Error(`Erro na requisição SSO: status ${response.status}`);
      }

      const authUrl = response.body.authorizationUrl;

      if (!authUrl) {
        throw new Error('authorizationUrl não encontrado na resposta');
      }

      return cy.wrap(authUrl, { log: false });
    });
});
