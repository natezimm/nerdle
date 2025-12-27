import { jest } from '@jest/globals';

// Mock five-letter words
await jest.unstable_mockModule('../utils.js', () => ({
  fourLetterWords: ['bash', 'json', 'http'],
  fiveLetterWords: ['apple', 'hello', 'world'],
  sixLetterWords: ['docker', 'socket', 'client'],
  default: ['apple', 'hello', 'world'],
}));

const { default: router } = await import('../routes/wordRoutes.js');

const getRouteHandler = (method, path) => {
  const layer = router.stack.find(
    (routeLayer) =>
      routeLayer.route?.path === path && routeLayer.route?.methods?.[method]
  );
  return layer?.route?.stack?.[0]?.handle;
};

const createRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

test('GET /api/words/random via router returns a word of requested length', async () => {
  const handler = getRouteHandler('get', '/random');
  expect(handler).toBeDefined();

  const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
  try {
    const res = createRes();
    handler?.({ query: { length: '4' } }, res);
    expect(res.json).toHaveBeenCalledWith({ word: expect.any(String) });
    const word = res.json.mock.calls[0]?.[0]?.word;
    expect(word).toHaveLength(4);

    const resDefault = createRes();
    handler?.({}, resDefault);
    expect(resDefault.json).toHaveBeenCalledWith({ word: expect.any(String) });
    const defaultWord = resDefault.json.mock.calls[0]?.[0]?.word;
    expect(defaultWord).toHaveLength(5);
  } finally {
    randomSpy.mockRestore();
  }
});

test('POST /api/words/validate via router validates words case-insensitively', async () => {
  const handler = getRouteHandler('post', '/validate');
  expect(handler).toBeDefined();

  const res1 = createRes();
  handler?.({ body: { word: 'Apple' } }, res1);
  expect(res1.json).toHaveBeenCalledWith({ valid: true });

  const res2 = createRes();
  handler?.({ body: { word: 'unknown' } }, res2);
  expect(res2.json).toHaveBeenCalledWith({ valid: false });

  const res3 = createRes();
  handler?.({ body: { word: 'bash' } }, res3);
  expect(res3.json).toHaveBeenCalledWith({ valid: true });

  const res4 = createRes();
  handler?.({ body: { word: 'docker' } }, res4);
  expect(res4.json).toHaveBeenCalledWith({ valid: true });
});

test('POST /api/words/validate rejects invalid input', async () => {
  const handler = getRouteHandler('post', '/validate');
  expect(handler).toBeDefined();

  // Empty word
  const res1 = createRes();
  handler?.({ body: { word: '' } }, res1);
  expect(res1.status).toHaveBeenCalledWith(400);
  expect(res1.json).toHaveBeenCalledWith({ error: 'Invalid word: must be 1-10 characters' });

  // Word too long (> 10 chars)
  const res2 = createRes();
  handler?.({ body: { word: 'abcdefghijk' } }, res2);
  expect(res2.status).toHaveBeenCalledWith(400);
  expect(res2.json).toHaveBeenCalledWith({ error: 'Invalid word: must be 1-10 characters' });

  // Non-alphabetic characters
  const res3 = createRes();
  handler?.({ body: { word: 'test123' } }, res3);
  expect(res3.status).toHaveBeenCalledWith(400);
  expect(res3.json).toHaveBeenCalledWith({ error: 'Invalid word: alphabetic characters only' });

  // Non-string input
  const res4 = createRes();
  handler?.({ body: { word: 12345 } }, res4);
  expect(res4.status).toHaveBeenCalledWith(400);
  expect(res4.json).toHaveBeenCalledWith({ error: 'Invalid word: must be 1-10 characters' });

  // Missing word
  const res5 = createRes();
  handler?.({ body: {} }, res5);
  expect(res5.status).toHaveBeenCalledWith(400);
  expect(res5.json).toHaveBeenCalledWith({ error: 'Invalid word: must be 1-10 characters' });
});
