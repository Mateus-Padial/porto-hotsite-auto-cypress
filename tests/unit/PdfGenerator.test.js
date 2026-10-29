import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

async function loadPdfGenerator() {
  const mod = await import('../../cypress/support/utils/PdfGenerator.js');
  return mod.default || mod;
}

describe('PdfGenerator', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('findReportFile returns first html file path', async () => {
    const PdfGenerator = await loadPdfGenerator();
    const generator = new PdfGenerator();
    const dir = path.resolve('tests/.tmp/pdf-report-ok');

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'report.html'), '<html></html>');
    generator.htmlDir = dir;

    const reportPath = generator.findReportFile();
    expect(reportPath).toContain('report.html');
  });

  it('findReportFile throws when no html exists', async () => {
    const PdfGenerator = await loadPdfGenerator();
    const generator = new PdfGenerator();
    const dir = path.resolve('tests/.tmp/pdf-report-empty');

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'report.txt'), 'no html');
    generator.htmlDir = dir;

    expect(() => generator.findReportFile()).toThrow('Nenhum arquivo HTML encontrado');
  });

  it('loadReport opens file URL and waits for body', async () => {
    const PdfGenerator = await loadPdfGenerator();
    const generator = new PdfGenerator();
    generator.page = {
      goto: vi.fn().mockResolvedValue(undefined),
      waitForSelector: vi.fn().mockResolvedValue(undefined),
    };

    await generator.loadReport('C:\\temp\\report.html');

    expect(generator.page.goto).toHaveBeenCalledTimes(1);
    expect(generator.page.waitForSelector).toHaveBeenCalledWith('body', { timeout: 10000 });
  });

  it('initBrowser creates browser and page', async () => {
    const fakePage = {};
    const fakeBrowser = { newPage: vi.fn().mockResolvedValue(fakePage) };
    const launchSpy = vi.fn().mockResolvedValue(fakeBrowser);
    const require = createRequire(import.meta.url);
    const puppeteer = require('puppeteer');
    const originalLaunch = puppeteer.launch;
    puppeteer.launch = launchSpy;

    const PdfGenerator = await loadPdfGenerator();
    const generator = new PdfGenerator();

    await generator.initBrowser();

    expect(launchSpy).toHaveBeenCalledTimes(1);
    expect(fakeBrowser.newPage).toHaveBeenCalledTimes(1);
    expect(generator.page).toBe(fakePage);

    puppeteer.launch = originalLaunch;
  });

  it('waitForCharts handles timeout without throwing', async () => {
    const PdfGenerator = await loadPdfGenerator();
    const generator = new PdfGenerator();
    generator.page = {
      waitForFunction: vi.fn().mockRejectedValue(new Error('timeout')),
      waitForSelector: vi.fn(),
      waitForTimeout: vi.fn(),
    };

    await expect(generator.waitForCharts()).resolves.toBeUndefined();
  });

  it('generatePdf calls page.pdf with expected options', async () => {
    const PdfGenerator = await loadPdfGenerator();
    const generator = new PdfGenerator();
    generator.page = {
      pdf: vi.fn().mockResolvedValue(undefined),
    };

    await generator.generatePdf();

    expect(generator.page.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        path: generator.outputPath,
        format: 'A4',
        printBackground: true,
      }),
    );
  });

  it('closeBrowser closes when browser exists', async () => {
    const PdfGenerator = await loadPdfGenerator();
    const generator = new PdfGenerator();
    generator.browser = {
      close: vi.fn().mockResolvedValue(undefined),
    };

    await generator.closeBrowser();

    expect(generator.browser.close).toHaveBeenCalledTimes(1);
  });

  it('execute closes browser in finally even when load fails', async () => {
    const PdfGenerator = await loadPdfGenerator();
    const generator = new PdfGenerator();
    const closeSpy = vi.spyOn(generator, 'closeBrowser').mockResolvedValue(undefined);

    vi.spyOn(generator, 'initBrowser').mockResolvedValue(undefined);
    vi.spyOn(generator, 'findReportFile').mockReturnValue('cypress/reports/html/report.html');
    vi.spyOn(generator, 'loadReport').mockRejectedValue(new Error('load failed'));

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    await generator.execute();

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(closeSpy).toHaveBeenCalledTimes(1);

    exitSpy.mockRestore();
  });
});
