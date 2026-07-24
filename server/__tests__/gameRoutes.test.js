import { jest } from '@jest/globals';
import createGameRouter from '../routes/gameRoutes.js';

const getRouteHandlers = (router, method, path) => {
  const layer = router.stack.find(
    (routeLayer) =>
      routeLayer.route?.path === path && routeLayer.route?.methods?.[method]
  );
  return layer?.route?.stack.map((routeHandler) => routeHandler.handle) ?? [];
};

const createRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

test('POST /api/games starts a game without exposing an answer', () => {
  const gameService = {
    createGame: () => ({
      gameId: 'game-1',
      wordLength: 5,
      maxAttempts: 6,
    }),
    submitGuess: () => {
      throw new Error('not used');
    },
  };
  const router = createGameRouter({ gameService });
  const [handler] = getRouteHandlers(router, 'post', '/');
  const res = createRes();

  handler?.({ body: { wordLength: 5 } }, res);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({
    gameId: 'game-1',
    wordLength: 5,
    maxAttempts: 6,
  });
  const response = res.json.mock.calls[0][0];
  expect(response).not.toHaveProperty('answer');
  expect(response).not.toHaveProperty('word');
});

test('POST /api/games/:id/guesses returns game feedback', () => {
  const gameService = {
    createGame: () => {
      throw new Error('not used');
    },
    submitGuess: (gameId, word) => ({
      ok: true,
      result: {
        valid: true,
        score: ['correct', 'correct', 'correct', 'correct', 'correct'],
        won: true,
        complete: true,
        attemptsRemaining: 5,
        answer: word,
        gameId,
      },
    }),
  };
  const router = createGameRouter({ gameService });
  const [handler] = getRouteHandlers(router, 'post', '/:gameId/guesses');
  const res = createRes();

  handler?.({ params: { gameId: 'game-1' }, body: { word: 'apple' } }, res);

  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      valid: true,
      won: true,
      answer: 'apple',
      gameId: 'game-1',
    })
  );
});

test('guess route forwards service errors and optional rate limiting', () => {
  const gameService = {
    createGame: () => {
      throw new Error('not used');
    },
    submitGuess: () => ({
      ok: false,
      status: 404,
      error: 'Game not found or expired',
    }),
  };
  const limiter = jest.fn();
  const routerWithLimiter = createGameRouter({
    gameService,
    guessLimiter: limiter,
  });
  const handlersWithLimiter = getRouteHandlers(
    routerWithLimiter,
    'post',
    '/:gameId/guesses'
  );
  expect(handlersWithLimiter[0]).toBe(limiter);

  const router = createGameRouter({ gameService });
  const [handler] = getRouteHandlers(router, 'post', '/:gameId/guesses');
  const res = createRes();
  handler?.({ params: { gameId: 'missing' }, body: { word: 'apple' } }, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    error: 'Game not found or expired',
  });
});
