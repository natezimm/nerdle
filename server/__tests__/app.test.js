import { jest } from '@jest/globals';
import { createApp, createCorsOptions } from '../app.js';

const getRouteHandler = (app, method, path) => {
  const routeLayer = app._router.stack.find(
    (layer) => layer.route?.path === path && layer.route?.methods?.[method]
  );

  return routeLayer?.route?.stack?.[0]?.handle;
};

const createRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('app', () => {
  test('registers health endpoint', () => {
    const app = createApp({ NODE_ENV: 'test' });
    const healthHandler = getRouteHandler(app, 'get', '/api/health');
    const res = createRes();

    expect(healthHandler).toBeDefined();
    healthHandler?.({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
  });

  test('mounts the word router', () => {
    const app = createApp({ NODE_ENV: 'test' });
    const mountedRouters = app._router.stack.filter(
      (layer) => layer.name === 'router'
    );

    expect(mountedRouters.length).toBeGreaterThan(0);
    expect(
      mountedRouters.some((layer) => String(layer.regexp).includes('api'))
    ).toBe(true);
  });

  test('rejects disallowed CORS origins in production', () => {
    const corsOptions = createCorsOptions({ NODE_ENV: 'production' });
    const callback = jest.fn();

    corsOptions.origin('https://not-allowed.example', callback);

    expect(callback).toHaveBeenCalled();
    expect(callback.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  });

  test('allows configured and local development origins', () => {
    const corsOptions = createCorsOptions({
      NODE_ENV: 'development',
      CORS_ORIGIN: 'https://preview.example',
    });
    const configuredCallback = jest.fn();
    const localCallback = jest.fn();
    const noOriginCallback = jest.fn();

    corsOptions.origin('https://preview.example', configuredCallback);
    corsOptions.origin('http://localhost:9999', localCallback);
    corsOptions.origin(undefined, noOriginCallback);

    expect(configuredCallback).toHaveBeenCalledWith(null, true);
    expect(localCallback).toHaveBeenCalledWith(null, true);
    expect(noOriginCallback).toHaveBeenCalledWith(null, true);
  });
});
