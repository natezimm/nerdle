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

export const scoreGuess = (targetWord, guess) => {
  const targetLetters = targetWord.toLowerCase().split('');
  const guessLetters = guess.toLowerCase().split('');
  const result = Array(guessLetters.length).fill(LETTER_STATUS.ABSENT);
  const remainingTargetLetters = new Map();

  guessLetters.forEach((letter, index) => {
    if (targetLetters[index] === letter) {
      result[index] = LETTER_STATUS.CORRECT;
      return;
    }

    const targetLetter = targetLetters[index];
    remainingTargetLetters.set(
      targetLetter,
      (remainingTargetLetters.get(targetLetter) ?? 0) + 1
    );
  });

  guessLetters.forEach((letter, index) => {
    if (result[index] === LETTER_STATUS.CORRECT) return;

    const remainingCount = remainingTargetLetters.get(letter) ?? 0;
    if (remainingCount > 0) {
      result[index] = LETTER_STATUS.PRESENT;
      remainingTargetLetters.set(letter, remainingCount - 1);
    }
  });

  return result;
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
