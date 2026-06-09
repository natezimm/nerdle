import techWords, { techWordsByLength } from '../techWords.js';
import { fourLetterWords, fiveLetterWords, sixLetterWords } from '../utils.js';

export const SUPPORTED_WORD_LENGTHS = [4, 5, 6];
export const DEFAULT_WORD_LENGTH = 5;

const wordListsByLength = {
  4: fourLetterWords,
  5: fiveLetterWords,
  6: sixLetterWords,
};

const dictionarySetsByLength = Object.fromEntries(
  Object.entries(wordListsByLength).map(([length, words]) => [
    length,
    new Set(words),
  ])
);

const techWordSetsByLength = Object.fromEntries(
  Object.entries(techWordsByLength).map(([length, words]) => [
    length,
    new Set(words),
  ])
);

export const normalizeWordLength = (value) => {
  const parsed = Number(value);
  return SUPPORTED_WORD_LENGTHS.includes(parsed) ? parsed : DEFAULT_WORD_LENGTH;
};

export const getRandomTechWord = (requestedLength, random = Math.random) => {
  const wordLength = normalizeWordLength(requestedLength);
  const wordPool = techWordsByLength[wordLength] ?? techWords;
  return wordPool[Math.floor(random() * wordPool.length)];
};

export const normalizeGuess = (word) => {
  if (typeof word !== 'string' || word.length === 0 || word.length > 10) {
    return {
      ok: false,
      error: 'Invalid word: must be 1-10 characters',
    };
  }

  if (!/^[a-zA-Z]+$/.test(word)) {
    return {
      ok: false,
      error: 'Invalid word: alphabetic characters only',
    };
  }

  return {
    ok: true,
    word: word.toLowerCase(),
  };
};

export const isValidGuess = (normalizedWord) => {
  const wordLength = normalizedWord.length;
  const dictionaryWords = dictionarySetsByLength[wordLength] ?? new Set();
  const techWordPool = techWordSetsByLength[wordLength] ?? new Set();

  return (
    dictionaryWords.has(normalizedWord) || techWordPool.has(normalizedWord)
  );
};
