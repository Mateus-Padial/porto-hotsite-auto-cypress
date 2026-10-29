# Porto Plus — Automação de Testes E2E (Hotsite)

Automação de testes end-to-end do hotsite **Porto Plus** utilizando **Cypress** com **Cucumber (BDD/Gherkin)** e o padrão **Page Object Model (POM)**. O projeto é organizado por domínio funcional (home deslogada, home logada e catálogo), com autenticação via SSO feita por API e suporte a navegação cross-origin para o marketplace.

---

## Índice

- [Stack e tecnologias](#stack-e-tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Padrões adotados](#padrões-adotados)
- [Cenários cobertos](#cenários-cobertos)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração de ambiente](#configuração-de-ambiente)
- [Como executar os testes](#como-executar-os-testes)
- [Relatórios](#relatórios)
- [Evidências de teste](#evidências-de-teste)
- [Qualidade de código e segurança](#qualidade-de-código-e-segurança)
- [Testes unitários](#testes-unitários)
- [Documentação técnica (MkDocs)](#documentação-técnica-mkdocs)
- [Pipeline (Azure DevOps)](#pipeline-azure-devops)
- [Convenções e tags](#convenções-e-tags)
- [Solução de problemas](#solução-de-problemas)

---

## Stack e tecnologias

| Categoria                | Ferramenta                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Runner E2E               | [Cypress](https://www.cypress.io/)                                                                                                                           |
| BDD                      | [@badeball/cypress-cucumber-preprocessor](https://github.com/badeball/cypress-cucumber-preprocessor)                                                         |
| Bundler de specs         | [@bahmutov/cypress-esbuild-preprocessor](https://github.com/bahmutov/cypress-esbuild-preprocessor) + esbuild                                                 |
| Linguagem                | JavaScript (ES6+)                                                                                                                                            |
| Padrão de projeto        | Page Object Model (POM)                                                                                                                                      |
| Variáveis de ambiente    | [dotenv](https://github.com/motdotla/dotenv) + [dotenv-cli](https://github.com/entropitor/dotenv-cli) + [cross-env](https://github.com/kentcdodds/cross-env) |
| Relatórios               | mochawesome + mochawesome-merge + mochawesome-report-generator                                                                                               |
| Geração de PDF           | Puppeteer + Chart.js                                                                                                                                         |
| Lint e formatação        | ESLint (`eslint-plugin-cypress`) + Prettier                                                                                                                  |
| Evidências               | `sharp` (compressão de screenshots) + `generate-evidences.js`                                                                                                |
| Testes unitários (utils) | [Vitest](https://vitest.dev/)                                                                                                                                |
| CI/CD                    | Azure DevOps Pipelines (+ gitleaks para scan de segredos)                                                                                                    |
| Documentação técnica     | MkDocs (`mkdocs.yml` + `docs/`), catalogada via Backstage (`catalog-info.yaml`)                                                                              |

---

## Arquitetura

O fluxo de um teste BDD percorre as seguintes camadas:

```
.feature (Gherkin)
   │  cenário em linguagem natural
   ▼
.js de steps (Given/When/Then)
   │  traduz cada passo em chamadas de Page Object
   ▼
Page Object (extends BasePage)
   │  orquestra as ações da página, retorna `this` (fluent API)
   ▼
Elements
   │  centraliza os seletores CSS da UI
   ▼
Comandos customizados (cy.*) + cy.origin
   │  autenticação SSO, acesso ao marketplace, ações globais
   ▼
Aplicação (hotsite Porto Plus / marketplace)
```

### Autenticação e acesso ao catálogo

A autenticação **não** passa pela UI — é feita via API com `cy.request`, o que torna os testes mais rápidos e estáveis:

1. `getAccessToken` → `POST /authentication/v1/token` (usa `auth_token`, `subscription_key`, `cpf`)
2. `SSO` → `POST /authentication/v1/sso` → retorna a `authorizationUrl`
3. `acessarCatalogoViaUrlSSO` → `POST /participants/v1/session-marketplace` → gera a URL de SSO (com `jwt=`) e visita o catálogo

O catálogo roda em outro domínio (`http://localhost`), portanto todas as interações com ele acontecem dentro de blocos **`cy.origin()`**.

As rotas de API ficam centralizadas em `cypress/support/constants/routes.js`:

```js
AUTH_ROUTES = { TOKEN: '/authentication/v1/token', SSO: '/authentication/v1/sso' };
HOTSITE_ROUTES = { SESSION_MARKETPLACE: '/participants/v1/session-marketplace' };
```

---

## Estrutura de pastas

```
portoseguro-hotsite-auto/
├── cypress/
│   ├── e2e/
│   │   ├── features/                  # Cenários BDD (.feature) + steps (.js)
│   │   │   ├── catalogo/              # catalogo_pf.feature / catalogo_pf.js
│   │   │   ├── home_deslogado/        # home_deslogado.feature / .js
│   │   │   └── home_logado/           # home_logado.feature / .js
│   │   ├── gui/
│   │   │   ├── base/
│   │   │   │   └── BasePage.js         # Classe base com helpers reutilizáveis
│   │   │   ├── elements/               # Seletores da UI por domínio
│   │   │   │   ├── catalogo/
│   │   │   │   ├── cenario_logado/
│   │   │   │   └── cenario_deslogado/
│   │   │   └── pages/                  # Page Objects (ações)
│   │   │       ├── index.js            # Barrel export das páginas
│   │   │       ├── catalogo/
│   │   │       ├── cenario_logado/
│   │   │       └── cenario_deslogado/
│   │   └── specs/                      # Specs Cypress puros (sem BDD)
│   ├── support/
│   │   ├── authentication_sso/
│   │   │   └── commands.js             # Comandos getAccessToken / SSO
│   │   ├── hotsite_commands/
│   │   │   └── commands.js             # Comandos do domínio do hotsite/catálogo
│   │   ├── constants/
│   │   │   ├── routes.js               # Rotas de API
│   │   │   └── Timeouts.js             # Timeouts padronizados
│   │   ├── exception/
│   │   │   └── exception.js            # Tratamento de uncaught:exception
│   │   ├── hooks/
│   │   │   └── hooks.js                # beforeEach/afterEach globais
│   │   ├── utils/
│   │   │   ├── BrowserRunner.js         # Execução multi-navegador
│   │   │   └── PdfGenerator.js          # Geração de relatório em PDF
│   │   └── e2e.js                      # Suporte global (importa todos os commands/hooks)
│   ├── downloads/  videos/  screenshots/  reports/   # Artefatos (gerados, ignorados no git)
├── tests/
│   └── unit/                           # Testes unitários (Vitest) dos utils
├── docs/                               # Documentação técnica (MkDocs)
├── .env.example                        # Template das variáveis de ambiente (sem segredos)
├── .cypress-cucumber-preprocessorrc.json # Filtro de specs por tags
├── azure-pipelines.yml                 # Pipeline de CI/CD
├── catalog-info.yaml                   # Registro do componente no Backstage
├── cypress.config.js                   # Configuração principal do Cypress
├── eslint.config.mjs                   # Configuração do ESLint
├── generate-evidences.js               # Geração do JSON de evidências
├── generate-pdf.js                     # Entry point da geração de PDF
├── mkdocs.yml                          # Configuração do site de documentação
├── runAllBrowsers.js                   # Entry point da execução multi-navegador
├── vitest.config.js                    # Configuração do Vitest
├── tsconfig.json
└── package.json
```

---

## Padrões adotados

### Page Object Model (POM)

Toda página estende `BasePage` (`cypress/e2e/gui/base/BasePage.js`), que oferece helpers reutilizáveis e **fluent API** (cada método retorna `this`):

```js
class CatalogoPage extends BasePage {
  validarAcessoCatalogo() {
    cy.validarAcessoCatalogo();
    return this;
  }
}
```

Helpers disponíveis no `BasePage` incluem: `visit`, `waitForElement`, `clickQuandoVisivel`, `clickWithJS`, `validateUrlContains`, `validateElementVisible`, `resolverDoMapa`, `stubWindowOpen`, entre outros.

### Separação Elements × Pages

- **Elements** (`gui/elements/`): apenas seletores, expostos via getters.
- **Pages** (`gui/pages/`): apenas ações e validações, consumindo os seletores.

Isso isola mudanças de UI (basta atualizar o seletor) das mudanças de fluxo.

### Timeouts padronizados

Em vez de números mágicos, use `cypress/support/constants/Timeouts.js`:

| Constante                    | Valor (ms) |
| ---------------------------- | ---------- |
| `SHORT`                      | 1500       |
| `DEFAULT`                    | 7000       |
| `MEDIUM` / `ELEMENT_VISIBLE` | 10000      |
| `LONG` / `API_REQUEST`       | 15000      |
| `EXTRA_LONG`                 | 20000      |
| `PAGE_LOAD`                  | 30000      |
| `ANIMATION`                  | 500        |

### Hooks e tratamento de exceções globais

- `support/hooks/hooks.js`: captura screenshot em falha e faz `intercept` de Feature-Flag e Google Analytics no `beforeEach`.
- `support/exception/exception.js`: ignora `uncaught:exception` da aplicação para não derrubar os testes por erros de runtime do app.

---

## Cenários cobertos

| Domínio        | Feature                                                      | Cenários | Requer login (SSO) |
| -------------- | ------------------------------------------------------------ | -------- | ------------------ |
| Home deslogada | `cypress/e2e/features/home_deslogado/home_deslogado.feature` | 13       | Não                |
| Home logada    | `cypress/e2e/features/home_logado/home_logado.feature`       | 14       | Sim                |
| Catálogo (PF)  | `cypress/e2e/features/catalogo/catalogo_pf.feature`          | 13       | Sim                |

Cada `.feature` possui um arquivo `.js` de mesmo nome com as step definitions. Os cenários são filtrados por tags (`@smoke`, `@skip`) pelo `@badeball/cypress-cucumber-preprocessor` (`filterSpecs` e `omitFiltered` ativos em `.cypress-cucumber-preprocessorrc.json`).

Existem ainda specs Cypress puros (sem BDD) em `cypress/e2e/specs/` (`hotsite_deslogado.cy.js` e `hotsite_logado.cy.js`); o `specPattern` do `cypress.config.js` executa apenas os `.feature`.

---

## Pré-requisitos

- **Node.js** >= 22.x (versão usada na pipeline; o mínimo funcional é 18.x)
- **npm**
- Navegadores instalados localmente: **Chrome** e/ou **Edge**
- Acesso às credenciais de ambiente (ver [Configuração de ambiente](#configuração-de-ambiente))

---

## Instalação

```bash
git clone http://localhost/portoseguro-hotsite-auto.git
cd portoseguro-hotsite-auto
npm ci          # instalação limpa e reprodutível (recomendado)
npx cypress install
```

> Use `npm ci` quando quiser uma instalação fiel ao `package-lock.json` (como na pipeline). Para desenvolvimento local, `npm install` também funciona.

---

## Configuração de ambiente

As credenciais e URLs ficam em arquivos `.env.<ambiente>` na raiz do projeto. Esses arquivos são **ignorados pelo git** (`.gitignore` cobre `.env.*`) e devem ser criados localmente.

Para começar, copie o template `.env.example` (versionado, sem segredos) e preencha os valores:

```bash
cp .env.example .env.hml      # ou .env.dev / .env.prd
```

O ambiente é selecionado pela variável `CYPRESS_ENV` (padrão: `prd`), que define qual arquivo `.env` é carregado:

```js
// cypress.config.js
const ENV = process.env.CYPRESS_ENV || 'prd';
dotenv.config({ path: `.env.${ENV}` });
```

### Arquivos esperados

- `.env.prd`
- `.env.hml`
- `.env.dev` (opcional — não há scripts npm dedicados; use `CYPRESS_ENV=dev`)

### Variáveis necessárias

```env
base_url=<URL base da API de autenticação/sessão>
meu_porto_url=<URL do hotsite Porto Plus>
auth_token=<token de autenticação>
subscription_key=<chave de subscription (APIM)>
cpf=<CPF do usuário de teste>
key_sso=<subscription key para SSO/session-marketplace>
CYPRESS_RECORD_KEY=<chave de gravação do Cypress Cloud — opcional, só para --record>
DEBUG=false
```

| Variável             | Obrigatória | Uso                                                                   |
| -------------------- | ----------- | --------------------------------------------------------------------- |
| `CYPRESS_ENV`        | Não         | Ambiente alvo (`dev`, `hml`, `prd`); padrão `prd`                     |
| `base_url`           | Sim         | URL base da API de autenticação/SSO (também é o `baseUrl` do Cypress) |
| `meu_porto_url`      | Sim         | URL do hotsite Porto Plus aberta no navegador                         |
| `auth_token`         | Sim         | Token Bearer enviado em `/authentication/v1/token`                    |
| `subscription_key`   | Sim         | Subscription key da APIM para o endpoint de token                     |
| `cpf`                | Sim         | CPF da massa de teste (nunca use CPF real de cliente)                 |
| `key_sso`            | Sim         | Subscription key da APIM para SSO / `session-marketplace`             |
| `CYPRESS_RECORD_KEY` | Não         | Gravação no Cypress Cloud (`--record`)                                |
| `DEBUG`              | Não         | `true` liga logs adicionais                                           |

> Os valores versionados neste repositório (`.env.example`, README, features e Page Objects) usam `http://localhost` como placeholder. Para executar de fato, informe as URLs reais nos `.env.*` e ajuste o domínio do marketplace, fixo em `MARKETPLACE_ORIGIN` (`cypress/support/hotsite_commands/commands.js` e `CatalogoPage.js`), além dos links de saída em `home_deslogado.feature`. O `projectId` do Cypress Cloud em `cypress.config.js` também está vazio.

> ⚠️ Nunca faça commit dos arquivos `.env.*` — eles contêm dados sensíveis. Na pipeline, esses valores vêm de variáveis secretas do Azure DevOps.

As variáveis são expostas aos testes via `Cypress.env('<nome>')` (configuradas em `env` no `cypress.config.js`).

---

## Como executar os testes

Todos os scripts abaixo já carregam o `.env` correto via `dotenv-cli` e definem o navegador via `cross-env`.

### Modo interativo (Cypress App)

```bash
npm run test:gui      # abre o Cypress (cypress open)
```

### Modo headless — Produção (`.env.prd`)

```bash
npm run test:chrome:headless      # Chrome headless
npm run test:electron:headless    # Electron headless
npm run test:chrome               # Chrome (com --record)
npm run test:edge                 # Edge (com --record)
npm run test:electron             # Electron (com --record)
```

### Modo headless — Homologação (`.env.hml`)

```bash
npm run test:chrome:headless:hml  # Chrome headless em HML
npm run test:chrome_hml           # Chrome em HML (com --record)
npm run test:edge_hml             # Edge em HML (com --record)
```

### Todos os navegadores

```bash
npm run test:all      # executa via runAllBrowsers.js (BrowserRunner)
```

### Executar um único feature ou por tags

```bash
# Um feature específico
npx cross-env BROWSER_NAME=chrome npx cypress run \
  --browser chrome --headless \
  --spec "cypress/e2e/features/catalogo/catalogo_pf.feature" \
  --env CYPRESS_ENV=prd

# Apenas cenários de smoke (e ignorando os marcados com @skip)
npx cross-env BROWSER_NAME=chrome npx cypress run \
  --browser chrome --headless \
  --env "CYPRESS_ENV=prd,tags=@smoke and not @skip"
```

---

## Relatórios

Os relatórios usam **mochawesome** (configurado em `cypress.config.js` com `html: false, json: true`). Após uma execução, os JSONs ficam em `cypress/reports/mocha/`.

```bash
npm run report          # merge dos JSON + HTML + PDF (pipeline completo)
npm run report:merge    # apenas mescla os JSON em report.json
npm run report:html     # gera o HTML a partir do report.json
npm run report:pdf      # gera o PDF (generate-pdf.js / Puppeteer)
```

Em execução local (fora de CI), o `cypress.config.js` dispara automaticamente a geração de relatório no hook `after:run` — a menos que `GENERATE_REPORT_AFTER_RUN=false`.

### Execução multi-navegador

`npm run test:all` (`runAllBrowsers.js`) usa a classe `BrowserRunner` (`cypress/support/utils/BrowserRunner.js`) para rodar Chrome, Edge e Electron e reportar o código de saída de cada um.

> As pastas `cypress/reports/`, `cypress/videos/`, `cypress/screenshots/` e `*.pdf` são ignoradas pelo git.

---

## Evidências de teste

`generate-evidences.js` gera `cypress/reports/evidencias.json` cruzando três fontes: o `report.json` (resultado de cada cenário), os `.feature` (grupo, título e critérios de aceite) e as screenshots por navegador (convertidas em base64, redimensionadas e comprimidas em JPEG com `sharp`). Um orçamento global de tamanho mantém o JSON dentro do limite de ~5 MB do `localStorage` da plataforma de importação.

```bash
npm run report:evidencias                       # merge dos JSON + geração das evidências
node generate-evidences.js --max-evidencias 3   # limita evidências por cenário
node generate-evidences.js --width 1000 --quality 60 --budget-mb 4
node generate-evidences.js --out caminho/custom.json
```

Fora de CI, o hook `after:run` do `cypress.config.js` também chama esse script automaticamente.

---

## Qualidade de código e segurança

```bash
npm run lint           # ESLint
npm run lint:fix       # ESLint com correção automática
npm run format         # Prettier (escreve)
npm run format:check   # Prettier (apenas verifica)
```

- Lint e testes unitários rodam na pipeline (stage `Qualidade`) antes de qualquer teste E2E.
- **Scan de segredos:** o job `SecretScan` executa o **gitleaks** (`--no-git --redact`) sobre os arquivos versionados e falha o build se encontrar credenciais. Os `.env.*` são ignorados pelo git, portanto não existem no CI.
- Nunca versione tokens, subscription keys, CPFs reais ou URLs internas: use `.env.<ambiente>` localmente e variáveis secretas do Azure DevOps na pipeline. Segredos que já vazaram devem ser **rotacionados**.

---

## Testes unitários

Os utilitários em `cypress/support/utils/` (ex.: `BrowserRunner`, `PdfGenerator`) têm cobertura de testes unitários com **Vitest**:

```bash
npm run test:unit            # roda uma vez
npm run test:unit:watch      # modo watch
npm run test:unit:coverage   # com cobertura (v8)
```

---

## Documentação técnica (MkDocs)

A pasta `docs/` (`index`, `architecture`, `configuration`, `dependencies`, `api-reference`) é publicada via MkDocs e referenciada no Backstage (`backstage.io/techdocs-ref: dir:.` em `catalog-info.yaml`). Para visualizar localmente:

```bash
pip install mkdocs mkdocs-material
mkdocs serve
```

---

## Pipeline (Azure DevOps)

Definida em `azure-pipelines.yml`. Resumo:

- **Gatilhos:** push e PR para `master`. O agendamento diário (cron) foi **desativado**; para reativar, adicione novamente um bloco `schedules` no `azure-pipelines.yml`.
- **Stage `Qualidade`:** jobs `SecretScan` (gitleaks) e `LintUnit` (ESLint + Vitest).
- **Stage `PRSmoke`** (somente em Pull Requests): roda os cenários `@smoke and not @skip` no Chrome headless.
- **Stage `InstallAndTest`** (fora de PR): executa, em paralelo, jobs para cada combinação de domínio × navegador:
  - Deslogado — Chrome / Edge
  - Logado — Chrome / Edge
  - Catálogo — Chrome / Edge
- **Job `RelatorioFinal`:** depende de todos os jobs acima (`condition: always()`), baixa os JSONs publicados como artefatos, mescla, gera HTML e PDF consolidados e publica como `RELATORIO_FINAL_<BuildId>`.

Cada job publica screenshots, vídeos e o JSON de resultado como artefatos da pipeline.

### Variáveis secretas usadas na pipeline

`base_url`, `auth_token`, `subscription_key`, `cpf`, `key_sso`, `meu_porto_url` — configuradas no Azure DevOps e injetadas como `env` em cada step.

---

## Convenções e tags

- **`@smoke`** — cenários críticos executados na verificação de PR.
- **`@skip`** — cenários temporariamente desabilitados (não executados na pipeline).
- Cenários seguem a nomenclatura `CTxx - <descrição>` (ex.: `CT01 - Validar as informações exibidas na home`).
- Os textos (features, descrições, mensagens) são escritos em **português**, com acentuação correta.

---

## Solução de problemas

### Erro de Execution Policy no PowerShell (Windows)

Ao rodar scripts npm, se aparecer erro de política de execução, abra o PowerShell como administrador e execute:

```powershell
Set-ExecutionPolicy RemoteSigned
```

Confirme com `S` (ou `Y`) e pressione Enter.

### Testes do catálogo travando ou lentos em headless

O catálogo é uma SPA (React/Ant Design) com modal de jornada guiada que aparece de forma assíncrona. O comando `cy.dispensarModalJornadaSeVisivel()` aguarda e fecha esse modal antes das ações. Caso haja lentidão, verifique:

- Que as flags de Chrome headless em `cypress.config.js` (`before:browser:launch`) estão ativas.
- Que `video: false` está mantido em CI para reduzir consumo de recursos.

### Falha de autenticação (`Cypress.env` indefinido)

Confirme que o arquivo `.env.<CYPRESS_ENV>` existe na raiz e contém todas as variáveis listadas em [Configuração de ambiente](#configuração-de-ambiente). Use `Cypress.env('nome')` (e não `cy.env(...)`) para ler variáveis.

---

## Licença

ISC.
