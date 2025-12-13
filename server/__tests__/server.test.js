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
    post: (path, handler) => {
      postRoutes.push({ path, handler });
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

    expect(corsMock).toHaveBeenCalledWith({
      origin: 'https://example.com',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
    });
    expect(bodyParserJson).toHaveBeenCalled();
    expect(useCalls).toEqual(['cors-middleware', 'json-middleware']);

    const randomRoute = getRoutes.find(route => route.path === '/api/words/random');
    expect(randomRoute).toBeDefined();
    const randomHandler = randomRoute?.handler;
    expect(randomHandler).toBeDefined();
    const randomRes = { json: jest.fn() };
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    randomHandler?.({}, randomRes);
    randomSpy.mockRestore();
    expect(randomRes.json).toHaveBeenCalledWith({ word: 'admin' });

    const validateRoute = postRoutes.find(route => route.path === '/api/words/validate');
    expect(validateRoute).toBeDefined();
    const validateHandler = validateRoute?.handler;
    expect(validateHandler).toBeDefined();
    const validRes = { json: jest.fn() };
    validateHandler?.({ body: { word: 'apple' } }, validRes);
    expect(validRes.json).toHaveBeenCalledWith({ valid: true });
    const invalidRes = { json: jest.fn() };
    validateHandler?.({ body: { word: 'zzzzz' } }, invalidRes);
    expect(invalidRes.json).toHaveBeenCalledWith({ valid: false });

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
    expect(useCalls).toEqual(['cors-middleware', 'json-middleware']);
    expect(getRoutes).toHaveLength(1);
    expect(postRoutes).toHaveLength(1);
  });
});
