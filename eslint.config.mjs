import js from '@eslint/js';
import globals from 'globals';
import cypress from 'eslint-plugin-cypress';
import prettier from 'eslint-config-prettier';

export default [
  // Ignorados globais
  {
    ignores: [
      'node_modules/**',
      'cypress/reports/**',
      'cypress/videos/**',
      'cypress/screenshots/**',
      'cypress/downloads/**',
      'tests/.tmp/**',
      '**/*.pdf',
    ],
  },

  // Base recomendada para todo JS
  js.configs.recommended,

  // Configs e scripts Node (CommonJS) na raiz
  {
    files: [
      '*.config.js',
      'cypress.config.js',
      'vitest.config.js',
      'generate-pdf.js',
      'generate-evidences.js',
      'runAllBrowsers.js',
    ],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },

  // Código Cypress (page objects, commands, support) — ESM + globais Cypress
  {
    ...cypress.configs.recommended,
    files: ['cypress/**/*.js'],
    languageOptions: {
      ...cypress.configs.recommended.languageOptions,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha,
        ...cypress.configs.recommended.languageOptions?.globals,
      },
    },
    rules: {
      ...cypress.configs.recommended.rules,
      // Padrões intencionais nesta suíte (esperas fixas para modais React assíncronos,
      // chains em helpers do POM). Mantidos como aviso para tratamento gradual,
      // sem bloquear o pipeline. Reavaliar caso a caso ao refatorar.
      'cypress/no-unnecessary-waiting': 'warn',
      'cypress/unsafe-to-chain-command': 'warn',
      'cypress/no-assigning-return-values': 'warn',
    },
  },

  // Testes unitários (Vitest)
  {
    files: ['tests/**/*.{test,spec}.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
  },

  // Regras do projeto
  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },

  // Desativa regras de estilo que conflitam com o Prettier (deve vir por último)
  prettier,
];
