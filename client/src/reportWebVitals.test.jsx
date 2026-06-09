import { describe, test, expect, vi } from 'vitest';
import reportWebVitals from './reportWebVitals.jsx';

describe('reportWebVitals', () => {
  test('does nothing when no callback provided', async () => {
    await expect(reportWebVitals()).resolves.toBeUndefined();
    await expect(reportWebVitals(null)).resolves.toBeUndefined();
    await expect(reportWebVitals(undefined)).resolves.toBeUndefined();
  });

  test('does nothing when callback is not a function', async () => {
    await expect(reportWebVitals('not a function')).resolves.toBeUndefined();
    await expect(reportWebVitals(123)).resolves.toBeUndefined();
    await expect(reportWebVitals({})).resolves.toBeUndefined();
  });

  test('accepts a function callback without throwing', async () => {
    const mockCallback = vi.fn();
    await expect(reportWebVitals(mockCallback)).resolves.toBeUndefined();
  });
});
