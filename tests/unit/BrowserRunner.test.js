import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadBrowserRunner() {
  const mod = await import('../../cypress/support/utils/BrowserRunner.js');
  return mod.default || mod;
}

describe('BrowserRunner', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('runAll exits with code 1 when any browser fails', async () => {
    const BrowserRunner = await loadBrowserRunner();
    const runner = new BrowserRunner();

    vi.spyOn(runner, 'runBrowser')
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});

    await runner.runAll();

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it('runAll does not exit when all browsers succeed', async () => {
    const BrowserRunner = await loadBrowserRunner();
    const runner = new BrowserRunner();

    vi.spyOn(runner, 'runBrowser')
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});

    await runner.runAll();

    expect(exitSpy).not.toHaveBeenCalled();
    exitSpy.mockRestore();
  });

  it('runSpecific exits when browser name is invalid', async () => {
    const BrowserRunner = await loadBrowserRunner();
    const runner = new BrowserRunner();
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});

    await runner.runSpecific(['safari']);

    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it('runSpecific executes only selected browsers', async () => {
    const BrowserRunner = await loadBrowserRunner();
    const runner = new BrowserRunner();

    const runBrowserSpy = vi.spyOn(runner, 'runBrowser').mockResolvedValue(0);
    await runner.runSpecific(['chrome', 'electron']);

    expect(runBrowserSpy).toHaveBeenCalledTimes(2);
    expect(runBrowserSpy.mock.calls[0][0].name).toBe('chrome');
    expect(runBrowserSpy.mock.calls[1][0].name).toBe('electron');
  });

  it('runBrowser resolves with real command exit code', async () => {
    const BrowserRunner = await loadBrowserRunner();
    const runner = new BrowserRunner();

    const code = await runner.runBrowser({
      name: 'node',
      cmd: 'node -e "process.exit(0)"',
    });

    expect(code).toBe(0);
  }, 15000);
});
