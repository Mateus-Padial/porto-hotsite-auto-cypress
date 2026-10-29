Cypress.on('uncaught:exception', (err) => {
  console.warn('Ignorado erro global:', err?.message);
  return false;
});

Cypress.on('window:before:load', (win) => {
  if (typeof win.fetch !== 'function') {
    return;
  }

  const originalFetch = win.fetch.bind(win);

  win.fetch = (...args) => {
    const req = args[0];
    const url = typeof req === 'string' ? req : req?.url;

    if (typeof url === 'string' && url.includes('Feature-Flag/EnableBEPrint')) {
      return Promise.resolve(new Response('{}', { status: 200 }));
    }

    return originalFetch(...args);
  };
});
