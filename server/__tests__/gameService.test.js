import { jest } from '@jest/globals';

await jest.unstable_mockModule('../utils.js', () => ({
  fourLetterWords: ['bash', 'json', 'http'],
  fiveLetterWords: ['apple', 'hello', 'plane', 'allee'],
  sixLetterWords: ['docker', 'socket', 'client'],
  default: ['apple', 'hello', 'plane', 'allee'],
}));

const { LETTER_STATUS, createGameService, scoreGuess } =
  await import('../services/gameService.js');

describe('gameService', () => {
  test('creates an opaque game without returning its answer', () => {
    const service = createGameService({
      selectWord: () => 'apple',
      createId: () => 'opaque-id',
      now: () => 100,
    });

    const game = service.createGame(5);

    expect(game).toEqual({
      gameId: 'opaque-id',
      wordLength: 5,
      maxAttempts: 6,
    });
    expect(game).not.toHaveProperty('word');
    expect(game).not.toHaveProperty('answer');
  });

  test('scores exact, present, absent, and duplicate letters', () => {
    expect(scoreGuess('apple', 'plane')).toEqual([
      LETTER_STATUS.PRESENT,
      LETTER_STATUS.PRESENT,
      LETTER_STATUS.PRESENT,
      LETTER_STATUS.ABSENT,
      LETTER_STATUS.CORRECT,
    ]);
    expect(scoreGuess('apple', 'allee')).toEqual([
      LETTER_STATUS.CORRECT,
      LETTER_STATUS.PRESENT,
      LETTER_STATUS.ABSENT,
      LETTER_STATUS.ABSENT,
      LETTER_STATUS.CORRECT,
    ]);
  });

  test('returns score feedback without the answer during active play', () => {
    const service = createGameService({
      selectWord: () => 'apple',
      createId: () => 'game-1',
    });
    service.createGame(5);

    const submission = service.submitGuess('game-1', 'plane');

    expect(submission).toEqual({
      ok: true,
      result: {
        valid: true,
        score: ['present', 'present', 'present', 'absent', 'correct'],
        won: false,
        complete: false,
        attemptsRemaining: 5,
      },
    });
    expect(submission.result).not.toHaveProperty('answer');
  });

  test('reveals the answer only when the game is complete', () => {
    const service = createGameService({
      selectWord: () => 'apple',
      createId: () => 'game-1',
    });
    service.createGame(5);

    const win = service.submitGuess('game-1', 'apple');
    expect(win.result).toMatchObject({
      valid: true,
      won: true,
      complete: true,
      answer: 'apple',
    });

    expect(service.submitGuess('game-1', 'apple')).toEqual({
      ok: false,
      status: 409,
      error: 'Game is already complete',
    });
  });

  test('does not consume an attempt for invalid dictionary words', () => {
    const service = createGameService({
      selectWord: () => 'apple',
      createId: () => 'game-1',
    });
    service.createGame(5);

    expect(service.submitGuess('game-1', 'zzzzz')).toEqual({
      ok: true,
      result: { valid: false },
    });
    expect(
      service.submitGuess('game-1', 'plane').result.attemptsRemaining
    ).toBe(5);
  });

  test('rejects malformed, wrong-length, missing, and expired games', () => {
    let currentTime = 0;
    const service = createGameService({
      selectWord: () => 'apple',
      createId: () => 'game-1',
      now: () => currentTime,
      ttlMs: 100,
    });
    service.createGame(5);

    expect(service.submitGuess('game-1', '12345')).toMatchObject({
      ok: false,
      status: 400,
    });
    expect(service.submitGuess('game-1', 'bash')).toEqual({
      ok: false,
      status: 400,
      error: 'Guess must be 5 letters',
    });
    expect(service.submitGuess('missing', 'apple')).toMatchObject({
      ok: false,
      status: 404,
    });

    currentTime = 100;
    expect(service.submitGuess('game-1', 'apple')).toMatchObject({
      ok: false,
      status: 404,
    });
  });

  test('evicts the oldest game when the active-game limit is reached', () => {
    let id = 0;
    const service = createGameService({
      selectWord: () => 'apple',
      createId: () => `game-${++id}`,
      maxActiveGames: 1,
    });
    service.createGame(5);
    service.createGame(5);

    expect(service.submitGuess('game-1', 'apple')).toMatchObject({
      ok: false,
      status: 404,
    });
    expect(service.submitGuess('game-2', 'apple')).toMatchObject({
      ok: true,
    });
  });
});

test('hints skip solved positions, stay the same, and cost no attempts', () => {
  const service = createGameService({ selectWord: () => 'apple' });
  const { gameId } = service.createGame(5);
  service.submitGuess(gameId, 'allee');
  const hint = service.getHint(gameId);
  expect(hint).toEqual({ ok: true, result: { position: 2, letter: 'p' } });
  expect(service.getHint(gameId)).toEqual(hint);
  expect(service.submitGuess(gameId, 'hello').result.attemptsRemaining).toBe(4);
  service.submitGuess(gameId, 'apple');
  expect(service.getHint(gameId).status).toBe(409);
});
test('hints reject missing and expired games', () => {
  let time = 0;
  const service = createGameService({
    selectWord: () => 'apple',
    now: () => time,
    ttlMs: 10,
  });
  expect(service.getHint('missing').status).toBe(404);
  const { gameId } = service.createGame(5);
  time = 10;
  expect(service.getHint(gameId).status).toBe(404);
});

test('category hints cover every answer without consuming the letter hint', async () => {
  const { techWordsByLength } = await import('../techWords.js');
  for (const word of Object.values(techWordsByLength).flat()) {
    const service = createGameService({ selectWord: () => word });
    const { gameId } = service.createGame(word.length);
    const category = service.getHint(gameId, 'category');
    expect(category.ok).toBe(true);
    expect(category.result.category).toEqual(expect.any(String));
    expect(category.result.category.length).toBeGreaterThan(5);
    expect(Object.keys(category.result)).toEqual(['category']);
    expect(service.getHint(gameId, 'letter').result).toEqual({
      position: 1,
      letter: word[0],
    });
    expect(service.submitGuess(gameId, word).result.attemptsRemaining).toBe(5);
  }
  expect(createGameService().getHint('missing', 'unknown').status).toBe(400);
});
