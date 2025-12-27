import { render } from '@testing-library/react';
import { act } from 'react';
import { vi, describe, test, expect, afterEach } from 'vitest';
import WordGrid from './WordGrid.jsx';

describe('WordGrid', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    test('renders persisted statuses for an attempt', () => {
        vi.useFakeTimers();
        const { container } = render(
            <WordGrid attempts={['plane']} currentGuess="" targetWord="apple" />
        );
        act(() => {
            vi.advanceTimersByTime(2000);
        });
        const letters = container.querySelectorAll('.word-row:first-child .letter');
        expect(letters).toHaveLength(5);
        expect(letters[0]).toHaveClass('present-final');
        expect(letters[1]).toHaveClass('present-final');
        expect(letters[2]).toHaveClass('present-final');
        expect(letters[3]).toHaveClass('absent-final');
        expect(letters[4]).toHaveClass('correct-final');
    });

    test('shows flip classes while animating', () => {
        vi.useFakeTimers();
        const { container } = render(
            <WordGrid attempts={['plane']} currentGuess="" targetWord="apple" />
        );
        // advance only the first flip (300ms)
        act(() => {
            vi.advanceTimersByTime(300);
        });
        const firstLetter = container.querySelector('.word-row:first-child .letter');
        expect(firstLetter).toHaveClass('flip');
        expect(firstLetter.className).toMatch(/-initial/);
        // finish remaining flips
        act(() => {
            vi.advanceTimersByTime(2000);
        });
        const letters = container.querySelectorAll('.word-row:first-child .letter');
        expect(letters[0]).toHaveClass('present-final');
    });
});
