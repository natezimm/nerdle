// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const createStorage = () => {
  const storage = new Map();

  return {
    get length() {
      return storage.size;
    },
    clear: () => {
      storage.clear();
    },
    getItem: (key) => {
      const normalizedKey = String(key);
      return storage.has(normalizedKey) ? storage.get(normalizedKey) : null;
    },
    key: (index) => Array.from(storage.keys())[index] ?? null,
    removeItem: (key) => {
      storage.delete(String(key));
    },
    setItem: (key, value) => {
      storage.set(String(key), String(value));
    },
  };
};

if (typeof globalThis.localStorage?.clear !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: createStorage(),
    configurable: true,
  });
}

const _realConsoleError = console.error.bind(console);
const _realConsoleWarn = console.warn.bind(console);
const IGNORED_MESSAGES = [
  'ReactDOMTestUtils.act',
  'Error fetching the word:',
  'Error validating the word:',
];

console.error = (...args) => {
  try {
    const msg = args
      .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
      .join(' ');
    if (IGNORED_MESSAGES.some((m) => msg.includes(m))) return;
  } catch {
    // Fall through to the real console when serialization fails.
  }
  _realConsoleError(...args);
};

console.warn = (...args) => {
  try {
    const msg = args
      .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
      .join(' ');
    if (IGNORED_MESSAGES.some((m) => msg.includes(m))) return;
  } catch {
    // Fall through to the real console when serialization fails.
  }
  _realConsoleWarn(...args);
};
