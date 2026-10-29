const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const createEsbuildPlugin =
  require('@badeball/cypress-cucumber-preprocessor/esbuild').createEsbuildPlugin;
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const isCI = process.env.CI === 'true';
const shouldGenerateReportAfterRun = process.env.GENERATE_REPORT_AFTER_RUN !== 'false';

function cleanReports() {
  const mochaDir = path.resolve('cypress/reports/mocha');
  if (fs.existsSync(mochaDir)) {
    fs.rmSync(mochaDir, { recursive: true, force: true });
  }
}

const ENV = process.env.CYPRESS_ENV || 'prd';
dotenv.config({ path: `.env.${ENV}` });

const mergedEnv = {
  base_url: process.env.base_url,
  auth_token: process.env.auth_token,
  subscription_key: process.env.subscription_key,
  cpf: process.env.cpf,
  key_sso: process.env.key_sso,
  meu_porto_url: process.env.meu_porto_url,
  DEBUG: process.env.DEBUG,
};

module.exports = defineConfig({
  projectId: '',
  numTestsKeptInMemory: 0,

  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports/mocha',
    overwrite: false,
    html: false,
    json: true,
  },

  e2e: {
    specPattern: 'cypress/e2e/features/**/*.feature',
    experimentalRunAllSpecs: true,
    supportFile: 'cypress/support/e2e.js',
    // Desabilitado intencionalmente: o fluxo de SSO navega cross-origin entre o hotsite
    // Porto Plus e o marketplace (marketplace) via cy.origin. Sem isso, as
    // protecoes same-origin do Chromium bloqueiam o redirecionamento. Restrito ao
    // contexto de testes E2E — nao reflete a configuracao da aplicacao em producao.
    chromeWebSecurity: false,
    // Required for current cucumber preprocessor runtime, which still uses Cypress.env() internally.
    allowCypressEnv: true,
    trashAssetsBeforeRuns: false,
    baseUrl: mergedEnv.base_url,
    env: mergedEnv,
    experimentalMemoryManagement: true,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 120000,
    requestTimeout: 20000,
    responseTimeout: 30000,

    retries: { runMode: 1, openMode: 0 },

    video: false,
    screenshotOnRunFailure: true,

    videosFolder: path.join('cypress', 'videos', process.env.BROWSER_NAME || 'default'),
    screenshotsFolder: path.join('cypress', 'screenshots', process.env.BROWSER_NAME || 'default'),

    // Resolução menor em headless — sem impacto visual, reduz uso de memória do renderer
    viewportWidth: isCI ? 1280 : 1920,
    viewportHeight: isCI ? 720 : 1080,

    async setupNodeEvents(on, config) {
      cleanReports();

      await addCucumberPreprocessorPlugin(on, config);
      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        }),
      );

      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.isHeadless) {
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--disable-background-timer-throttling');
          launchOptions.args.push('--disable-backgrounding-occluded-windows');
          launchOptions.args.push('--disable-renderer-backgrounding');
          // Desativa extensões e features desnecessárias em headless
          launchOptions.args.push('--disable-extensions');
          launchOptions.args.push('--disable-translate');
          launchOptions.args.push('--disable-sync');
          launchOptions.args.push('--disable-default-apps');
          launchOptions.args.push('--no-first-run');
          launchOptions.args.push('--no-default-browser-check');
        }

        return launchOptions;
      });

      on('after:run', () => {
        if (isCI || !shouldGenerateReportAfterRun) {
          console.log('Geracao de relatorio local ignorada neste ambiente.');
          return;
        }

        const { execSync } = require('child_process');

        try {
          console.log('Mesclando relatorios JSON...');
          execSync(
            'npx mochawesome-merge "cypress/reports/mocha/*.json" -o cypress/reports/report.json',
            { stdio: 'inherit' },
          );

          console.log('Gerando relatorio HTML...');
          execSync(
            'npx marge cypress/reports/report.json --reportDir cypress/reports/html --inline',
            { stdio: 'inherit' },
          );

          console.log('Gerando PDF...');
          execSync('node generate-pdf.js', { stdio: 'inherit' });

          console.log('Gerando JSON de evidencias...');
          execSync('node generate-evidences.js', { stdio: 'inherit' });

          console.log('RELATORIO PDF GERADO COM SUCESSO!');
        } catch (err) {
          console.error('ERRO NA GERACAO DO RELATORIO:', err.message);
        }
      });

      return config;
    },
  },
});
