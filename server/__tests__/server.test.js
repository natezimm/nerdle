import { jest } from '@jest/globals';

const originalEnv = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
};

const restoreEnv = () => {
  if (originalEnv.NODE_ENV === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = originalEnv.NODE_ENV;
  }

  if (originalEnv.PORT === undefined) {
    delete process.env.PORT;
  } else {
    process.env.PORT = originalEnv.PORT;
  }

  if (originalEnv.CORS_ORIGIN === undefined) {
    delete process.env.CORS_ORIGIN;
  } else {
    process.env.CORS_ORIGIN = originalEnv.CORS_ORIGIN;
  }
};

async function setupServerMocks() {
  const useCalls = [];
  const getRoutes = [];
  const postRoutes = [];
  const listenSpy = jest.fn();

  const appMock = {
    use: (middleware) => {
      useCalls.push(middleware);
    },
    get: (path, handler) => {
      getRoutes.push({ path, handler });
    },
    post: (path, ...args) => {
      const handler = args[args.length - 1];
      const middleware = args.length > 1 ? args.slice(0, -1) : [];
      postRoutes.push({ path, handler, middleware });
    },
    listen: listenSpy,
  };

  const expressMock = jest.fn(() => appMock);
  const corsMock = jest.fn(() => 'cors-middleware');
  const bodyParserJson = jest.fn(() => 'json-middleware');

  await jest.unstable_mockModule('dotenv/config', () => ({}));
  await jest.unstable_mockModule('express', () => ({
    default: expressMock,
  }));
  await jest.unstable_mockModule('cors', () => ({
    default: corsMock,
  }));
  await jest.unstable_mockModule('body-parser', () => ({
    default: { json: bodyParserJson },
  }));
  await jest.unstable_mockModule('helmet', () => ({
    default: jest.fn(() => 'helmet-middleware'),
  }));
  await jest.unstable_mockModule('express-rate-limit', () => ({
    default: jest.fn(() => 'rate-limit-middleware'),
  }));

  return {
    appMock,
    expressMock,
    corsMock,
    bodyParserJson,
    useCalls,
    getRoutes,
    postRoutes,
    listenSpy,
  };
}

describe('server configuration', () => {
  afterEach(() => {
    restoreEnv();
  });

  test('registers middleware, routes, and listens when not testing', async () => {
    jest.resetModules();
    process.env.NODE_ENV = 'production';
    process.env.PORT = '5555';
    process.env.CORS_ORIGIN = 'https://example.com';

    const {
      appMock,
      expressMock,
      corsMock,
      bodyParserJson,
      useCalls,
      getRoutes,
      postRoutes,
      listenSpy,
    } = await setupServerMocks();

    const { default: serverApp } = await import('../server.js');
    expect(serverApp).toBe(appMock);
    expect(expressMock).toHaveBeenCalled();

    expect(corsMock).toHaveBeenCalled();
    const corsOptions = corsMock.mock.calls[0]?.[0];
    expect(corsOptions).toBeDefined();
    expect(corsOptions).toMatchObject({
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
    });
    expect(typeof corsOptions.origin).toBe('function');
    const allowedCallback = jest.fn();
    const noOriginCallback = jest.fn();
    corsOptions.origin(undefined, noOriginCallback);
    expect(noOriginCallback).toHaveBeenCalledWith(null, true);
    corsOptions.origin('https://example.com', allowedCallback);
    expect(allowedCallback).toHaveBeenCalledWith(null, true);
    const deniedCallback = jest.fn();
    corsOptions.origin('https://not-allowed.com', deniedCallback);
    expect(deniedCallback).toHaveBeenCalled();
    expect(deniedCallback.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect(bodyParserJson).toHaveBeenCalled();
    expect(useCalls).toEqual(['cors-middleware', 'helmet-middleware', 'rate-limit-middleware', 'json-middleware']);

    const healthRoute = getRoutes.find(route => route.path === '/api/health');
    expect(healthRoute).toBeDefined();
    const healthHandler = healthRoute?.handler;
    expect(healthHandler).toBeDefined();
    const healthRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    healthHandler?.({}, healthRes);
    expect(healthRes.status).toHaveBeenCalledWith(200);
    expect(healthRes.json).toHaveBeenCalledWith({ status: 'ok' });

    const randomRoute = getRoutes.find(route => route.path === '/api/words/random');
    expect(randomRoute).toBeDefined();
    const randomHandler = randomRoute?.handler;
    expect(randomHandler).toBeDefined();
    const randomRes = { json: jest.fn() };
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    randomHandler?.({}, randomRes);
    const randomResFour = { json: jest.fn() };
    randomHandler?.({ query: { length: '4' } }, randomResFour);
    randomSpy.mockRestore();
    expect(randomRes.json).toHaveBeenCalledWith({ word: 'admin' });
    expect(randomResFour.json).toHaveBeenCalledWith({ word: 'bash' });

    const validateRoute = postRoutes.find(route => route.path === '/api/words/validate');
    expect(validateRoute).toBeDefined();
    const validateHandler = validateRoute?.handler;
    expect(validateHandler).toBeDefined();
    const validRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    validateHandler?.({ body: { word: 'apple' } }, validRes);
    expect(validRes.json).toHaveBeenCalledWith({ valid: true });
    const validResFour = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    validateHandler?.({ body: { word: 'bash' } }, validResFour);
    expect(validResFour.json).toHaveBeenCalledWith({ valid: true });
    const invalidRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    validateHandler?.({ body: { word: 'zzzzz' } }, invalidRes);
    expect(invalidRes.json).toHaveBeenCalledWith({ valid: false });
    const invalidResUnsupported = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    validateHandler?.({ body: { word: 'ab' } }, invalidResUnsupported);
    expect(invalidResUnsupported.json).toHaveBeenCalledWith({ valid: false });

    expect(listenSpy).toHaveBeenCalledWith('5555', expect.any(Function));
    const listenCallback = listenSpy.mock.calls[0]?.[1];
    expect(listenCallback).toBeDefined();
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    listenCallback?.();
    expect(logSpy).toHaveBeenCalledWith('Server is running on port 5555');
    logSpy.mockRestore();
  });

  test('falls back to port 4000 when PORT is not provided', async () => {
    jest.resetModules();
    process.env.NODE_ENV = 'production';
    delete process.env.PORT;

    const { listenSpy } = await setupServerMocks();
    const { default: serverApp } = await import('../server.js');
    expect(serverApp).toBeDefined();
    expect(listenSpy).toHaveBeenCalledWith(4000, expect.any(Function));

    const listenCallback = listenSpy.mock.calls[0]?.[1];
    expect(listenCallback).toBeDefined();
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    listenCallback?.();
    expect(logSpy).toHaveBeenCalledWith('Server is running on port 4000');
    logSpy.mockRestore();
  });

  test('skips the listener and still registers routes for test env', async () => {
    jest.resetModules();
    process.env.NODE_ENV = 'test';

    const {
      getRoutes,
      postRoutes,
      corsMock,
      bodyParserJson,
      useCalls,
      listenSpy,
    } = await setupServerMocks();

    await import('../server.js');
    expect(listenSpy).not.toHaveBeenCalled();
    expect(corsMock).toHaveBeenCalled();
    expect(bodyParserJson).toHaveBeenCalled();
    expect(useCalls).toEqual(['cors-middleware', 'helmet-middleware', 'rate-limit-middleware', 'json-middleware']);
    expect(getRoutes).toHaveLength(2);
    expect(postRoutes).toHaveLength(1);
  });
});
