import { describe, expect, test } from 'vitest';
import { LETTER_STATUS, mergeKeyboardStatuses, scoreGuess } from './scoring';

describe('scoreGuess', () => {
  test('scores exact, present, and absent letters', () => {
    expect(scoreGuess('apple', 'plane')).toEqual([
      LETTER_STATUS.PRESENT,
      LETTER_STATUS.PRESENT,
      LETTER_STATUS.PRESENT,
      LETTER_STATUS.ABSENT,
      LETTER_STATUS.CORRECT,
    ]);
  });

  test('does not over-credit duplicate letters', () => {
    expect(scoreGuess('apple', 'allee')).toEqual([
      LETTER_STATUS.CORRECT,
      LETTER_STATUS.PRESENT,
      LETTER_STATUS.ABSENT,
      LETTER_STATUS.ABSENT,
      LETTER_STATUS.CORRECT,
    ]);
  });

  test('prioritizes exact matches before present matches', () => {
    expect(scoreGuess('array', 'rarer')).toEqual([
      LETTER_STATUS.PRESENT,
      LETTER_STATUS.PRESENT,
      LETTER_STATUS.CORRECT,
      LETTER_STATUS.ABSENT,
      LETTER_STATUS.ABSENT,
    ]);
  });
});

describe('mergeKeyboardStatuses', () => {
  test('keeps the strongest known status for each letter', () => {
    const statuses = mergeKeyboardStatuses(
      { a: LETTER_STATUS.CORRECT, b: LETTER_STATUS.PRESENT },
      'baaa',
      [
        LETTER_STATUS.ABSENT,
        LETTER_STATUS.PRESENT,
        LETTER_STATUS.ABSENT,
        LETTER_STATUS.ABSENT,
      ]
    );

    expect(statuses).toEqual({
      a: LETTER_STATUS.CORRECT,
      b: LETTER_STATUS.PRESENT,
    });
  });
});
