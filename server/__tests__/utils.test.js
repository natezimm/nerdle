import { jest } from '@jest/globals';

// ESM-aware mocking for Jest using unstable_mockModule

const mockData = `apple
baker
candy
delta
echo
fiver
gamer
hello
world
`;

await jest.unstable_mockModule('fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue(mockData),
}));

const { default: fiveLetterWords } = await import('../utils.js');

test('utils loads five-letter words from file', () => {
  expect(Array.isArray(fiveLetterWords)).toBe(true);
  // 'apple' and 'baker' are 5 letters
  expect(fiveLetterWords).toContain('apple');
  expect(fiveLetterWords).toContain('baker');
  // 'hello' and 'world' are 5 letters
  expect(fiveLetterWords).toContain('hello');
  expect(fiveLetterWords.every(w => w.length === 5)).toBe(true);
});

test('utils returns empty array when readFile throws', async () => {
  // Reset module registry to re-import with a failing fs mock
  jest.resetModules();
  await jest.unstable_mockModule('fs/promises', () => ({
    readFile: jest.fn().mockRejectedValue(new Error('fail')),
  }));
  const errMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  const { default: fiveLetterWordsErr } = await import('../utils.js');
  expect(Array.isArray(fiveLetterWordsErr)).toBe(true);
  expect(fiveLetterWordsErr.length).toBe(0);
  errMock.mockRestore();
});
