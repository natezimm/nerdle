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

test('utils returns empty array when readFile throws during tests', async () => {
  jest.resetModules();
  const failingError = new Error('read failure (test env)');
  await jest.unstable_mockModule('fs/promises', () => ({
    readFile: jest.fn().mockRejectedValue(failingError),
  }));

  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const previousEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';

  try {
    const { default: fiveLetterWordsErr } = await import('../utils.js');
    expect(Array.isArray(fiveLetterWordsErr)).toBe(true);
    expect(fiveLetterWordsErr).toHaveLength(0);
    expect(consoleSpy).not.toHaveBeenCalled();
  } finally {
    consoleSpy.mockRestore();
    process.env.NODE_ENV = previousEnv;
  }
});

test('utils logs an error and returns empty array outside of test env', async () => {
  jest.resetModules();
  const failingError = new Error('read failure (prod env)');
  await jest.unstable_mockModule('fs/promises', () => ({
    readFile: jest.fn().mockRejectedValue(failingError),
  }));

  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const previousEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  try {
    const { default: fiveLetterWordsErr } = await import('../utils.js');
    expect(Array.isArray(fiveLetterWordsErr)).toBe(true);
    expect(fiveLetterWordsErr).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalledWith('Error reading words.txt file:', failingError);
  } finally {
    consoleSpy.mockRestore();
    process.env.NODE_ENV = previousEnv;
  }
});
