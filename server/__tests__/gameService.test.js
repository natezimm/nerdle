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
