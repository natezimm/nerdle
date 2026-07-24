import { describe, expect, test } from 'vitest';
import { LETTER_STATUS, mergeKeyboardStatuses } from './scoring';

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
