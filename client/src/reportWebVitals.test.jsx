import { describe, test, expect, vi } from 'vitest';
import reportWebVitals from './reportWebVitals.jsx';

describe('reportWebVitals', () => {
    test('does nothing when no callback provided', () => {
        expect(() => reportWebVitals()).not.toThrow();
        expect(() => reportWebVitals(null)).not.toThrow();
        expect(() => reportWebVitals(undefined)).not.toThrow();
    });

    test('does nothing when callback is not a function', () => {
        expect(() => reportWebVitals('not a function')).not.toThrow();
        expect(() => reportWebVitals(123)).not.toThrow();
        expect(() => reportWebVitals({})).not.toThrow();
    });

    test('accepts a function callback without throwing', async () => {
        const mockCallback = vi.fn();
        // reportWebVitals dynamically imports web-vitals, so we just verify it doesn't throw
        expect(() => reportWebVitals(mockCallback)).not.toThrow();
    });
});
