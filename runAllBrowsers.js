/**
 * Script para executar testes em múltiplos navegadores
 * Utiliza a classe BrowserRunner para gerenciar a execução
 */
const BrowserRunner = require('./cypress/support/utils/BrowserRunner');

// Executa testes em todos os navegadores
BrowserRunner.runAll();
