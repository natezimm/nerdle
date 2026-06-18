import techWords, { techWordsByLength } from '../techWords.js';

test('techWords exports array with expected words', () => {
  expect(Array.isArray(techWords)).toBe(true);
  expect(techWords.length).toBeGreaterThan(0);
  expect(techWords).toContain('admin');
  expect(techWords).toContain('debug');
});

test('tech word buckets contain unique lowercase alphabetic words of matching length', () => {
  Object.entries(techWordsByLength).forEach(([length, words]) => {
    const expectedLength = Number(length);
    const uniqueWords = new Set(words);

    expect(uniqueWords.size).toBe(words.length);

    words.forEach((word) => {
      expect(word).toHaveLength(expectedLength);
      expect(word).toMatch(/^[a-z]+$/);
    });
  });
});
