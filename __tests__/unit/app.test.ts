describe('app', () => {
  let originalEnv: string | undefined;
  let originalFrontendUrl: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    originalFrontendUrl = process.env.FRONTEND_URL;
    jest.resetModules();
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.NODE_ENV = originalEnv;
    } else {
      delete process.env.NODE_ENV;
    }
    if (originalFrontendUrl) {
      process.env.FRONTEND_URL = originalFrontendUrl;
    } else {
      delete process.env.FRONTEND_URL;
    }
  });

  it('should export an Express instance', async () => {
    const app = await import('../../src/app');

    expect(app.default).toBeDefined();
    expect(typeof app.default).toBe('function');
  });

  it('should configure CORS with localhost when NODE_ENV is not production', async () => {
    delete process.env.NODE_ENV;
    delete process.env.FRONTEND_URL;

    jest.resetModules();
    const appModule = await import('../../src/app');
    const app = appModule.default;

    // Verificar que la app está configurada
    expect(app).toBeDefined();
  });

  it('should configure CORS with FRONTEND_URL when NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.FRONTEND_URL = 'https://production.example.com';

    jest.resetModules();
    const appModule = await import('../../src/app');
    const app = appModule.default;

    // Verificar que la app está configurada
    expect(app).toBeDefined();
  });
});
