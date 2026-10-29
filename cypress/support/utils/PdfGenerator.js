const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PdfGenerator {
  constructor() {
    this.htmlDir = path.resolve('cypress/reports/html');
    this.outputPath = 'cypress/reports/relatorio-execucao.pdf';
    this.browser = null;
    this.page = null;
  }

  async initBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      this.page = await this.browser.newPage();
      console.log('✅ Navegador inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar navegador:', error.message);
      throw error;
    }
  }

  findReportFile() {
    try {
      const files = fs.readdirSync(this.htmlDir, { recursive: true });
      const reportFile = files.find((f) => f.endsWith('.html'));

      if (!reportFile) {
        throw new Error('Nenhum arquivo HTML encontrado no diretório de relatórios');
      }

      const reportPath = path.join(this.htmlDir, reportFile);
      console.log(`📄 Usando relatório: ${reportPath}`);
      return reportPath;
    } catch (error) {
      console.error('❌ Erro ao buscar arquivo de relatório:', error.message);
      throw error;
    }
  }

  async loadReport(reportPath) {
    try {
      const fileUrl = 'file:///' + reportPath.replace(/\\/g, '/');
      await this.page.goto(fileUrl, { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('body', { timeout: 10000 });
      console.log('📊 Relatório carregado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar relatório:', error.message);
      throw error;
    }
  }

  async activateChartsTab() {
    try {
      await this.page.evaluate(() => {
        const el = Array.from(document.querySelectorAll('a, button')).find((e) =>
          e.textContent.toLowerCase().includes('charts'),
        );
        if (el) el.click();
      });
      console.log('📊 Aba Charts acionada');
    } catch (error) {
      console.log('⚠️ Não foi possível ativar aba de gráficos');
    }
  }

  async waitForCharts() {
    try {
      // Aguarda Chart.js estar disponível
      await this.page.waitForFunction(() => window.Chart !== undefined, { timeout: 10000 });

      // Aguarda canvas dos gráficos
      await this.page.waitForSelector('canvas', { timeout: 10000 });

      // Tempo adicional para renderização completa
      await this.page.waitForTimeout(3000);

      console.log('📈 Gráficos renderizados com sucesso');
    } catch (error) {
      console.log('⚠️ Gráficos não renderizaram a tempo, mas PDF será gerado mesmo assim');
    }
  }

  async generatePdf() {
    try {
      await this.page.pdf({
        path: this.outputPath,
        format: 'A4',
        printBackground: true,
      });
      console.log('✅ PDF com dashboard gerado!');
      console.log(`📁 Localização: ${path.resolve(this.outputPath)}`);
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error.message);
      throw error;
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Navegador fechado');
    }
  }

  async execute() {
    try {
      console.log('🚀 Iniciando geração de PDF...');

      await this.initBrowser();
      const reportPath = this.findReportFile();
      await this.loadReport(reportPath);
      await this.activateChartsTab();
      await this.waitForCharts();
      await this.generatePdf();

      console.log('✅ Processo concluído com sucesso!');
    } catch (error) {
      console.error('❌ ERRO NA GERAÇÃO DO RELATÓRIO:', error.message);
      process.exit(1);
    } finally {
      await this.closeBrowser();
    }
  }

  static async run() {
    const generator = new PdfGenerator();
    await generator.execute();
  }
}

// Executa se for chamado diretamente
if (require.main === module) {
  PdfGenerator.run();
}

module.exports = PdfGenerator;
