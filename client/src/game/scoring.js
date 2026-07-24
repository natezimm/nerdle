// @ts-check

export const LETTER_STATUS = {
  CORRECT: 'correct',
  PRESENT: 'present',
  ABSENT: 'absent',
};

const STATUS_PRIORITY = {
  [LETTER_STATUS.ABSENT]: 1,
  [LETTER_STATUS.PRESENT]: 2,
  [LETTER_STATUS.CORRECT]: 3,
};

export const mergeKeyboardStatuses = (currentStatuses, guess, score) => {
  return guess.split('').reduce(
    (nextStatuses, letter, index) => {
      const status = score[index];
      const previousStatus = nextStatuses[letter];

      if (
        !previousStatus ||
        STATUS_PRIORITY[status] > STATUS_PRIORITY[previousStatus]
      ) {
        nextStatuses[letter] = status;
      }

      return nextStatuses;
    },
    { ...currentStatuses }
  );
};
