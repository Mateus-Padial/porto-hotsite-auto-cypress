/**
 * generate-evidences.js
 * -----------------------------------------------------------------------------
 * Gera um JSON de evidencias de testes no formato esperado pela plataforma de
 * importacao, a partir das execucoes do Cypress + cucumber-preprocessor.
 *
 * Cruza tres fontes:
 *   1. cypress/reports/report.json (mochawesome consolidado) -> resultado de cada cenario
 *   2. cypress/e2e/features/**.feature                       -> grupo, titulo e criterios de aceite
 *   3. cypress/screenshots/<browser>/<feature>/...png        -> evidencias (convertidas em base64)
 *
 * As screenshots sao redimensionadas e recomprimidas (JPEG) antes de virar
 * base64, e um orcamento global de tamanho garante que o JSON caiba no
 * localStorage da plataforma (limite ~5MB por origem).
 *
 * Saida: cypress/reports/evidencias.json
 *
 * Uso:
 *   node generate-evidences.js
 *   node generate-evidences.js --out caminho/custom.json --max-evidencias 3
 *   node generate-evidences.js --width 1000 --quality 60 --budget-mb 4
 *
 * Tambem e chamado automaticamente pelo hook after:run do cypress.config.js.
 * -----------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

// sharp e opcional: se ausente, cai para base64 do PNG original (sem comprimir).
let sharp = null;
try {
  sharp = require('sharp');
} catch {
  console.warn(
    '[evidencias] AVISO: pacote "sharp" nao encontrado — as imagens nao serao comprimidas.',
  );
}

// ---------------------------------------------------------------------------
// Configuracao
// ---------------------------------------------------------------------------
const ROOT = __dirname;
const REPORT_JSON = path.resolve(ROOT, 'cypress/reports/report.json');
const MOCHA_DIR = path.resolve(ROOT, 'cypress/reports/mocha');
const FEATURES_DIR = path.resolve(ROOT, 'cypress/e2e/features');
const SCREENSHOTS_DIR = path.resolve(ROOT, 'cypress/screenshots');

// Limite de imagens por cenario (o formato base aceita 3: arquivo_1/2/3).
const MAX_EVIDENCIAS = parseArg('--max-evidencias', 3);
const OUT_FILE = parseArg('--out', path.resolve(ROOT, 'cypress/reports/evidencias.json'));

// Compressao de imagem (sharp): largura maxima e qualidade JPEG.
// Padroes calibrados para manter o JSON abaixo de ~2.2MB (=4.4MB no localStorage
// em UTF-16) com dezenas de prints, preservando legibilidade.
// Ajuste via --width / --quality se necessario.
const IMG_WIDTH = parseArg('--width', 720);
const IMG_QUALITY = parseArg('--quality', 35);

// Orcamento total de base64 embutido (MB). IMPORTANTE: o localStorage armazena
// strings em UTF-16 (2 bytes por caractere), entao 1MB de JSON em disco ocupa
// ~2MB no localStorage. Com limite de ~5MB por origem, miramos ~2MB de arquivo
// para ter folga. Ao atingir o teto, paramos de embutir base64 e usamos apenas
// Link_evidencia para os cenarios restantes.
const BUDGET_MB = parseArg('--budget-mb', 2.2);
const BUDGET_BYTES = BUDGET_MB * 1024 * 1024;

// Pontuacao minima para considerar que uma screenshot pertence a um cenario.
// Evita casar por coincidencia de palavras curtas.
const MIN_SCORE = 30;

// Base de Id por grupo (Feature). Espacamento de 10000 acomoda subnumeros de CT
// (ex.: CT03.1, CT03.1.1) e exemplos de Scenario Outline sem colisao.
// Grupos nao listados recebem base incremental a partir de 10000.
const GROUP_ID_BASE = {
  // Exemplo do formato base original (mantido para referencia):
  // Login: 1000,
  // Cadastro: 2000,
};
let dynamicGroupBase = 10000;
const dynamicGroupMap = {};

// ---------------------------------------------------------------------------
// Helpers de argumentos
// ---------------------------------------------------------------------------
function parseArg(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) {
    const val = process.argv[idx + 1];
    return typeof fallback === 'number' ? Number(val) : val;
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// 1. Carrega o relatorio consolidado do mochawesome
// ---------------------------------------------------------------------------
function loadReport() {
  if (fs.existsSync(REPORT_JSON)) {
    return JSON.parse(fs.readFileSync(REPORT_JSON, 'utf-8'));
  }
  // Fallback: mescla os fragmentos individuais caso o report.json nao exista.
  if (fs.existsSync(MOCHA_DIR)) {
    const fragments = fs
      .readdirSync(MOCHA_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(fs.readFileSync(path.join(MOCHA_DIR, f), 'utf-8')));
    if (fragments.length) {
      return fragments.reduce(
        (acc, frag) => {
          acc.results.push(...(frag.results || []));
          return acc;
        },
        { results: [] },
      );
    }
  }
  throw new Error(`Nenhum relatorio encontrado. Rode os testes antes (esperado: ${REPORT_JSON}).`);
}

// ---------------------------------------------------------------------------
// 2. Extrai todos os testes (cenarios) de uma estrutura de suites aninhada
// ---------------------------------------------------------------------------
function collectTests(suite, featureFile, acc) {
  (suite.tests || []).forEach((t) => {
    acc.push({ ...t, featureFile: featureFile || suite.file });
  });
  (suite.suites || []).forEach((s) => collectTests(s, featureFile || suite.file, acc));
}

// ---------------------------------------------------------------------------
// 3. Le os criterios de aceite (passos Gherkin) de dentro do .feature
// ---------------------------------------------------------------------------
function buildFeatureIndex() {
  const index = {};
  if (!fs.existsSync(FEATURES_DIR)) return index;

  const featureFiles = walk(FEATURES_DIR).filter((f) => f.endsWith('.feature'));

  for (const file of featureFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split(/\r?\n/);

    let featureName = path.basename(file, '.feature');
    const scenarios = {};
    let background = [];
    let current = null;
    let collectingBackground = false;
    let pendingTags = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      if (line.startsWith('Feature:')) {
        featureName = line.replace('Feature:', '').trim();
        current = null;
        collectingBackground = false;
        continue;
      }

      if (line.startsWith('@')) {
        pendingTags = line.split(/\s+/).filter((t) => t.startsWith('@'));
        continue;
      }

      if (line.startsWith('Background:')) {
        collectingBackground = true;
        current = null;
        continue;
      }

      if (line.startsWith('Scenario Outline:') || line.startsWith('Scenario:')) {
        const titulo = line.replace(/Scenario Outline:|Scenario:/, '').trim();
        current = { steps: [], tags: pendingTags };
        scenarios[titulo] = current;
        collectingBackground = false;
        pendingTags = [];
        continue;
      }

      // Linhas de passo (Given/When/Then/And/But) ou tabelas/exemplos.
      if (/^(Given|When|Then|And|But|\*|Examples:|\|)/.test(line)) {
        if (collectingBackground) {
          background.push(line);
        } else if (current) {
          current.steps.push(line);
        }
      }
    }

    index[file] = { featureName, scenarios, background };
  }

  return index;
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 4. Indexa as screenshots em disco por arquivo .feature
// ---------------------------------------------------------------------------
function buildScreenshotIndex() {
  const byFeature = {};
  if (!fs.existsSync(SCREENSHOTS_DIR)) return byFeature;

  for (const file of walk(SCREENSHOTS_DIR)) {
    if (!/\.png$/i.test(file)) continue;
    // .../screenshots/<browser>/<grupo>/<feature>.feature/<arquivo>.png
    const match = file.match(/([^/\\]+)\.feature[/\\]/);
    const featureBasename = match ? match[1] : path.basename(path.dirname(file));
    (byFeature[featureBasename] = byFeature[featureBasename] || []).push({
      file,
      name: path.basename(file, '.png'),
    });
  }
  return byFeature;
}

// Normaliza texto p/ comparacao (sem acento, minusculo, sem pontuacao).
function normalize(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Remove o sufixo "(example #N)" que o cucumber adiciona aos Scenario Outline.
function stripExampleSuffix(title) {
  return title.replace(/\s*\(example #\d+\)\s*$/i, '').trim();
}

// Extrai o codigo CT completo do titulo (ex.: "CT03.1.1", "CT03").
function extractCtCode(title) {
  const m = title.match(/\bCT\s*([\d.]+)/i);
  return m ? m[1].replace(/\.+$/, '') : null;
}

// Pontua quanto uma screenshot combina com um cenario.
function scoreScreenshot(scenarioTitle, screenshotName) {
  const normTitle = normalize(stripExampleSuffix(scenarioTitle));
  const normName = normalize(screenshotName);
  const ct = extractCtCode(scenarioTitle);

  let score = 0;
  // Screenshot de falha (hook) contem o titulo completo do cenario.
  if (normTitle && normName.includes(normTitle)) score += 100;
  // Match pelo codigo CT exato.
  if (ct && new RegExp(`\\bct\\s*${ct.replace(/\./g, '\\.?')}\\b`, 'i').test(screenshotName)) {
    score += 60;
  }
  // Sobreposicao de palavras significativas (>=4 chars).
  const titleWords = new Set(normTitle.split(' ').filter((w) => w.length >= 4));
  const overlap = normName.split(' ').filter((w) => titleWords.has(w)).length;
  score += overlap * 10;
  return score;
}

// Comprime (redimensiona + JPEG) e retorna base64. Sem sharp, devolve o PNG cru.
async function toCompressedBase64(file) {
  try {
    if (!sharp) return fs.readFileSync(file).toString('base64');
    const buf = await sharp(file)
      .rotate()
      .resize({ width: IMG_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: IMG_QUALITY, mozjpeg: true })
      .toBuffer();
    return buf.toString('base64');
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 5. Mapeamentos de dominio
// ---------------------------------------------------------------------------
function mapResultado(state) {
  switch (state) {
    case 'passed':
      return 'OK';
    case 'failed':
      return 'NOK';
    case 'pending':
    case 'skipped':
    default:
      return 'Pendente';
  }
}

function resolveGroupBase(grupo) {
  if (GROUP_ID_BASE[grupo] != null) return GROUP_ID_BASE[grupo];
  if (dynamicGroupMap[grupo] == null) {
    dynamicGroupMap[grupo] = dynamicGroupBase;
    dynamicGroupBase += 10000;
  }
  return dynamicGroupMap[grupo];
}

// ---------------------------------------------------------------------------
// 6. Pipeline principal
// ---------------------------------------------------------------------------
function main() {
  return run();
}

async function run() {
  const report = loadReport();
  const featureIndex = buildFeatureIndex();
  const screenshotIndex = buildScreenshotIndex();

  // Indexa cenarios do .feature por titulo normalizado (sem sufixo de exemplo).
  const scenarioLookup = {};
  for (const file of Object.keys(featureIndex)) {
    const { featureName, scenarios } = featureIndex[file];
    const featureBasename = path.basename(file, '.feature');
    for (const titulo of Object.keys(scenarios)) {
      scenarioLookup[normalize(stripExampleSuffix(titulo))] = {
        grupo: featureName,
        featureBasename,
        steps: scenarios[titulo].steps,
        tags: scenarios[titulo].tags,
      };
    }
  }

  // Coleta todos os testes executados.
  const tests = [];
  (report.results || []).forEach((r) => collectTests(r, r.file, tests));

  // Contadores para gerar Id unico e estavel por (grupo + CT major).
  const idCounters = {}; // chave "grupo|major" -> proximo sub-indice

  const entries = [];
  for (const test of tests) {
    if (test.isHook) continue;

    const titulo = test.title;
    const meta = scenarioLookup[normalize(stripExampleSuffix(titulo))] || {};
    const grupo = meta.grupo || basenameFeature(test.featureFile);
    const featureBasename = meta.featureBasename || basenameFeature(test.featureFile);

    const resultado = mapResultado(test.state);
    const criterios = (meta.steps || []).join('\n');

    let observacoes = '';
    if (test.state === 'failed' && test.err && test.err.message) {
      observacoes = String(test.err.message).split('\n')[0].slice(0, 500);
    } else if ((meta.tags || []).includes('@skip')) {
      observacoes = 'Cenario marcado como @skip — nao executado.';
    }

    // Id = base do grupo + CTmajor*100 + sub-indice incremental.
    const base = resolveGroupBase(grupo);
    const ct = extractCtCode(titulo);
    const major = ct ? parseInt(ct, 10) : 99; // sem CT -> faixa 99xx
    const counterKey = `${grupo}|${major}`;
    const sub = idCounters[counterKey] || 0;
    idCounters[counterKey] = sub + 1;
    const id = base + major * 100 + sub;

    entries.push({
      id,
      grupo,
      featureBasename,
      titulo,
      resultado,
      criterios,
      observacoes,
      executou: test.state === 'passed' || test.state === 'failed',
    });
  }

  // Atribuicao gulosa de screenshots: cada arquivo usado uma vez, no melhor cenario.
  assignScreenshots(entries, screenshotIndex);

  // Comprime e embute base64 respeitando o orcamento global de tamanho.
  // Cenarios cujas imagens nao couberem no orcamento recebem Link_evidencia
  // (caminho relativo do 1o screenshot) em vez de base64, evitando estourar
  // a quota do localStorage da plataforma.
  let usedBytes = 0;
  let truncados = 0;
  entries.sort((a, b) => a.id - b.id);

  for (const e of entries) {
    e.evidencias = { arquivo_1_base64: null, arquivo_2_base64: null, arquivo_3_base64: null };
    e.link = '';

    for (let i = 0; i < e.shots.length && i < MAX_EVIDENCIAS; i++) {
      const b64 = await toCompressedBase64(e.shots[i]);
      if (!b64) continue;
      if (usedBytes + b64.length > BUDGET_BYTES) {
        // Estourou o orcamento: nao embute mais. Registra o caminho do print
        // original como referencia e sinaliza na observacao.
        if (!e.link) {
          e.link = path.relative(ROOT, e.shots[i]).replace(/\\/g, '/');
          const aviso =
            '[Evidencia nao embutida por limite de tamanho — ver arquivo em ' + e.link + ']';
          e.observacoes = e.observacoes ? `${e.observacoes}\n${aviso}` : aviso;
        }
        truncados += 1;
        break;
      }
      e.evidencias[`arquivo_${i + 1}_base64`] = b64;
      usedBytes += b64.length;
    }
  }

  const output = entries
    .map((e) => ({
      Id: e.id,
      Grupo: e.grupo,
      Titulo: e.titulo,
      Resultado: e.resultado,
      CriteriosAceite: e.criterios,
      Observações: e.observacoes,
      Link_evidencia: e.link || '',
      Evidencias: e.evidencias,
    }))
    .sort((a, b) => a.Id - b.Id);

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

  const comEvidencia = output.filter((o) => o.Evidencias.arquivo_1_base64).length;
  const tamanhoMB = (fs.statSync(OUT_FILE).size / 1024 / 1024).toFixed(2);
  console.log(`\n[evidencias] ${output.length} cenarios escritos em ${OUT_FILE}`);
  console.log(
    `[evidencias] OK: ${output.filter((o) => o.Resultado === 'OK').length} | ` +
      `NOK: ${output.filter((o) => o.Resultado === 'NOK').length} | ` +
      `Pendente: ${output.filter((o) => o.Resultado === 'Pendente').length} | ` +
      `com screenshot embutido: ${comEvidencia}`,
  );
  console.log(
    `[evidencias] tamanho do arquivo: ${tamanhoMB}MB (orcamento base64: ${BUDGET_MB}MB)` +
      (truncados
        ? ` | ${truncados} cenario(s) cairam para Link_evidencia por limite de tamanho`
        : ''),
  );
  // Estimativa de ocupacao no localStorage: ~2 bytes por caractere (UTF-16).
  const utf16MB = ((fs.statSync(OUT_FILE).size * 2) / 1024 / 1024).toFixed(2);
  if (utf16MB > 4.5) {
    console.warn(
      `[evidencias] AVISO: o arquivo ocupa ~${utf16MB}MB no localStorage (UTF-16) e ` +
        'pode estourar o limite de ~5MB da plataforma. Reduza --quality/--width ou --budget-mb.',
    );
  }
}

// Casa screenshots a cenarios de forma gulosa, sem reutilizar arquivos.
function assignScreenshots(entries, screenshotIndex) {
  entries.forEach((e) => (e.shots = []));

  // Monta candidatos (entry, file, score) apenas para cenarios executados.
  const candidates = [];
  for (const e of entries) {
    if (!e.executou) continue;
    const pool = screenshotIndex[e.featureBasename] || [];
    for (const shot of pool) {
      const score = scoreScreenshot(e.titulo, shot.name);
      if (score >= MIN_SCORE) candidates.push({ e, file: shot.file, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const usedFiles = new Set();
  for (const c of candidates) {
    if (usedFiles.has(c.file)) continue;
    if (c.e.shots.length >= MAX_EVIDENCIAS) continue;
    c.e.shots.push(c.file);
    usedFiles.add(c.file);
  }
}

function basenameFeature(file) {
  if (!file) return 'desconhecido';
  return path.basename(String(file).replace(/\\/g, '/'), '.feature');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[evidencias] ERRO:', err.message);
    process.exitCode = 1;
  });
}

module.exports = { main };
