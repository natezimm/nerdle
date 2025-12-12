import techWords from '../techWords.js';

test('techWords exports array with expected words', () => {
  expect(Array.isArray(techWords)).toBe(true);
  expect(techWords.length).toBeGreaterThan(0);
  expect(techWords).toContain('admin');
  expect(techWords).toContain('debug');
});
