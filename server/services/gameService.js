import { randomUUID } from 'node:crypto';
import {
  getRandomTechWord,
  isValidGuess,
  normalizeGuess,
  normalizeWordLength,
} from './wordService.js';

export const MAX_ATTEMPTS = 6;
export const GAME_TTL_MS = 6 * 60 * 60 * 1000;
export const MAX_ACTIVE_GAMES = 10_000;

export const LETTER_STATUS = {
  CORRECT: 'correct',
  PRESENT: 'present',
  ABSENT: 'absent',
};

export const scoreGuess = (targetWord, guess) => {
  const targetLetters = targetWord.split('');
  const guessLetters = guess.split('');
  const score = Array(guessLetters.length).fill(LETTER_STATUS.ABSENT);
  const remainingTargetLetters = new Map();

  guessLetters.forEach((letter, index) => {
    if (targetLetters[index] === letter) {
      score[index] = LETTER_STATUS.CORRECT;
      return;
    }

    const targetLetter = targetLetters[index];
    remainingTargetLetters.set(
      targetLetter,
      (remainingTargetLetters.get(targetLetter) ?? 0) + 1
    );
  });

  guessLetters.forEach((letter, index) => {
    if (score[index] === LETTER_STATUS.CORRECT) return;

    const remainingCount = remainingTargetLetters.get(letter) ?? 0;
    if (remainingCount > 0) {
      score[index] = LETTER_STATUS.PRESENT;
      remainingTargetLetters.set(letter, remainingCount - 1);
    }
  });

  return score;
};

export const createGameService = ({
  selectWord = getRandomTechWord,
  createId = randomUUID,
  now = Date.now,
  ttlMs = GAME_TTL_MS,
  maxActiveGames = MAX_ACTIVE_GAMES,
} = {}) => {
  const games = new Map();

  const removeExpiredGames = () => {
    const currentTime = now();
    for (const [gameId, game] of games) {
      if (currentTime - game.lastActiveAt >= ttlMs) {
        games.delete(gameId);
      }
    }
  };

  const makeRoom = () => {
    removeExpiredGames();
    while (games.size >= maxActiveGames) {
      const oldestGameId = games.keys().next().value;
      games.delete(oldestGameId);
    }
  };

  const createGame = (requestedLength) => {
    makeRoom();

    const wordLength = normalizeWordLength(requestedLength);
    const gameId = createId();
    const createdAt = now();

    games.set(gameId, {
      targetWord: selectWord(wordLength),
      wordLength,
      attempts: 0,
      complete: false,
      lastActiveAt: createdAt,
    });

    return {
      gameId,
      wordLength,
      maxAttempts: MAX_ATTEMPTS,
    };
  };

  const submitGuess = (gameId, rawGuess) => {
    removeExpiredGames();
    const game = games.get(gameId);

    if (!game) {
      return {
        ok: false,
        status: 404,
        error: 'Game not found or expired',
      };
    }

    if (game.complete) {
      return {
        ok: false,
        status: 409,
        error: 'Game is already complete',
      };
    }

    const normalized = normalizeGuess(rawGuess);
    if (!normalized.ok) {
      return {
        ok: false,
        status: 400,
        error: normalized.error,
      };
    }

    if (normalized.word.length !== game.wordLength) {
      return {
        ok: false,
        status: 400,
        error: `Guess must be ${game.wordLength} letters`,
      };
    }

    game.lastActiveAt = now();

    if (!isValidGuess(normalized.word)) {
      return {
        ok: true,
        result: {
          valid: false,
        },
      };
    }

    game.attempts += 1;
    const score = scoreGuess(game.targetWord, normalized.word);
    const won = normalized.word === game.targetWord;
    const complete = won || game.attempts >= MAX_ATTEMPTS;
    game.complete = complete;

    const result = {
      valid: true,
      score,
      won,
      complete,
      attemptsRemaining: MAX_ATTEMPTS - game.attempts,
    };

    if (complete) {
      result.answer = game.targetWord;
    }

    return {
      ok: true,
      result,
    };
  };

  return {
    createGame,
    submitGuess,
  };
};

export default createGameService();
