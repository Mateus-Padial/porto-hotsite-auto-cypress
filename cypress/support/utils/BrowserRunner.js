const { exec } = require('child_process');

class BrowserRunner {
  constructor() {
    this.browsers = [
      {
        name: 'chrome',
        cmd: 'cross-env BROWSER_NAME=chrome cypress run --browser chrome',
      },
      {
        name: 'edge',
        cmd: 'cross-env BROWSER_NAME=edge cypress run --browser edge',
      },
      {
        name: 'electron',
        cmd: 'cross-env BROWSER_NAME=electron cypress run --browser electron',
      },
    ];
    this.processes = [];
  }

  runBrowser(browser) {
    return new Promise((resolve) => {
      console.log(`🚀 Iniciando testes no ${browser.name}...`);

      const process = exec(browser.cmd);

      process.stdout.on('data', (data) => {
        console.log(`[${browser.name}] ${data}`);
      });

      process.stderr.on('data', (data) => {
        console.error(`[${browser.name} ERROR] ${data}`);
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ [${browser.name}] Testes concluídos com sucesso`);
        } else {
          console.error(`❌ [${browser.name}] Testes falharam com código ${code}`);
        }
        resolve(code);
      });

      this.processes.push(process);
    });
  }

  async runAll() {
    console.log('🎯 Executando testes em múltiplos navegadores...');
    console.log(`📋 Navegadores: ${this.browsers.map((b) => b.name).join(', ')}\n`);

    const promises = this.browsers.map((browser) => this.runBrowser(browser));

    try {
      const results = await Promise.all(promises);
      const failedCount = results.filter((code) => code !== 0).length;

      console.log('\n📊 Resumo da Execução:');
      console.log(`✅ Sucesso: ${results.length - failedCount}`);
      console.log(`❌ Falhas: ${failedCount}`);

      if (failedCount > 0) {
        console.log('\n⚠️ Alguns testes falharam. Verifique os logs acima.');
        process.exit(1);
      } else {
        console.log('\n🎉 Todos os testes foram executados com sucesso!');
      }
    } catch (error) {
      console.error('❌ Erro durante a execução dos testes:', error.message);
      process.exit(1);
    }
  }

  async runSpecific(browserNames) {
    const selectedBrowsers = this.browsers.filter((b) => browserNames.includes(b.name));

    if (selectedBrowsers.length === 0) {
      console.error('❌ Nenhum navegador válido selecionado');
      console.log(`Navegadores disponíveis: ${this.browsers.map((b) => b.name).join(', ')}`);
      process.exit(1);
    }

    console.log(`🎯 Executando testes em: ${selectedBrowsers.map((b) => b.name).join(', ')}\n`);

    const promises = selectedBrowsers.map((browser) => this.runBrowser(browser));
    await Promise.all(promises);
  }

  static async runAll() {
    const runner = new BrowserRunner();
    await runner.runAll();
  }

  static async runSpecific(browserNames) {
    const runner = new BrowserRunner();
    await runner.runSpecific(browserNames);
  }
}

// Executa se for chamado diretamente
if (require.main === module) {
  BrowserRunner.runAll();
}

module.exports = BrowserRunner;
