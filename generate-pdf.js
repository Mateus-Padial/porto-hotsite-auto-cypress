/**
 * Script de geração de PDF dos relatórios
 * Utiliza a classe PdfGenerator para converter HTML em PDF
 */
const PdfGenerator = require('./cypress/support/utils/PdfGenerator');

// Executa a geração do PDF
PdfGenerator.run();
