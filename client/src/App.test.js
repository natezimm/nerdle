import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import axios from 'axios';
import { updateStats } from './utils/stats';
import App from './App';

jest.mock('axios');
jest.mock('./utils/stats', () => ({
    ...jest.requireActual('./utils/stats'),
    updateStats: jest.fn(),
}));
const parseKeys = (keys) => keys.match(/(\{[^}]+\}|.)/g) || [];
const typeKeys = async (keys) => {
    for (const token of parseKeys(keys)) {
        const key = token.replace(/^{|}$/g, '');
        await act(async () => {
            fireEvent.keyDown(window, { key });
        });
    }
};

describe('App', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('falls back to default API URL when env var is missing', async () => {
        const previousApiUrl = process.env.REACT_APP_API_URL;
        delete process.env.REACT_APP_API_URL;

        axios.get.mockResolvedValueOnce({ data: { word: 'apple' } });
        render(<App />);

        await waitFor(() =>
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/words/random')
            )
        );

        if (previousApiUrl === undefined) {
            delete process.env.REACT_APP_API_URL;
        } else {
            process.env.REACT_APP_API_URL = previousApiUrl;
        }
    });

    test('shows fetch error message when random word API fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('network failure'));
        render(<App />);
        expect(await screen.findByText(/Failed to fetch the word/i)).toBeInTheDocument();
    });

    test('rejects guesses that are too short', async () => {
        axios.get.mockResolvedValueOnce({ data: { word: 'apple' } });
        render(<App />);
        await typeKeys('app{Enter}');
        expect(screen.getByText(/Guess must be 5 letters/i)).toBeInTheDocument();
        expect(axios.post).not.toHaveBeenCalled();
    });

    test('shows invalid word message when validate API marks it invalid', async () => {
        axios.get.mockResolvedValueOnce({ data: { word: 'apple' } });
        axios.post.mockResolvedValueOnce({ data: { valid: false } });
        render(<App />);
        await typeKeys('apple{Enter}');
        expect(await screen.findByText(/Invalid word\. Try again\./i)).toBeInTheDocument();
        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/api/words/validate'),
            { word: 'apple' }
        );
    });

    test('displays retry message when validation API throws', async () => {
        axios.get.mockResolvedValueOnce({ data: { word: 'apple' } });
        axios.post.mockRejectedValueOnce(new Error('validation failure'));
        render(<App />);
        await typeKeys('apple{Enter}');
        expect(await screen.findByText(/Error validating the word/i)).toBeInTheDocument();
    });

    test('opens stats, shows success message, and stops accepting input after winning', async () => {
        jest.useFakeTimers();
        const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(0);
        try {
            axios.get.mockResolvedValueOnce({ data: { word: 'apple' } });
            axios.post.mockResolvedValueOnce({ data: { valid: true } });
            render(<App />);
            await typeKeys('apple{Enter}');
            await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
            act(() => {
                jest.advanceTimersByTime(2000);
            });
            expect(await screen.findByText(/Congratulations!/i)).toBeInTheDocument();
            expect(await screen.findByText('Statistics')).toBeInTheDocument();
            expect(axios.post).toHaveBeenCalledTimes(1);
            await typeKeys('{Enter}');
            expect(axios.post).toHaveBeenCalledTimes(1);
        } finally {
            nowSpy.mockRestore();
        }
    });

    test('backspace removes letters from the current guess', async () => {
        axios.get.mockResolvedValueOnce({ data: { word: 'apple' } });
        const { container } = render(<App />);
        await typeKeys('ab');
        const letterCells = container.querySelectorAll('.word-grid .word-row:first-child .letter');
        expect(letterCells[0]).toHaveTextContent('a');
        expect(letterCells[1]).toHaveTextContent('b');
        await typeKeys('{Backspace}');
        expect(letterCells[0]).toHaveTextContent('a');
        expect(letterCells[1]).toHaveTextContent('');
    });

    test('updates keyboard letter statuses after a guess', async () => {
        jest.useFakeTimers();
        axios.get.mockResolvedValueOnce({ data: { word: 'apple' } });
        axios.post.mockResolvedValueOnce({ data: { valid: true } });
        render(<App />);
        await typeKeys('plane{Enter}');
        // updateLetterStatuses uses a 1500ms timeout
        act(() => {
            jest.advanceTimersByTime(1500);
        });
        // P, L, A should be present; E should be correct
        const pKey = screen.getByRole('button', { name: 'P' });
        const lKey = screen.getByRole('button', { name: 'L' });
        const aKey = screen.getByRole('button', { name: 'A' });
        const eKey = screen.getByRole('button', { name: 'E' });
        expect(pKey).toHaveClass('present');
        expect(lKey).toHaveClass('present');
        expect(aKey).toHaveClass('present');
        expect(eKey).toHaveClass('correct');
    });

    test('handles repeated letters and updates statuses correctly', async () => {
        jest.useFakeTimers();
        axios.get.mockResolvedValueOnce({ data: { word: 'apple' } });
        axios.post.mockResolvedValueOnce({ data: { valid: true } });
        render(<App />);
        await typeKeys('allee{Enter}');
        act(() => {
            jest.advanceTimersByTime(1500);
        });
        const aKey = screen.getByRole('button', { name: 'A' });
        const lKey = screen.getByRole('button', { name: 'L' });
        const eKey = screen.getByRole('button', { name: 'E' });
        expect(aKey).toHaveClass('correct');
        expect(lKey).toHaveClass('present');
        expect(eKey).toHaveClass('correct');
    });

    test("doesn't downgrade 'correct' statuses on later guesses", async () => {
        jest.useFakeTimers();
        axios.get.mockResolvedValue({ data: { word: 'apple' } });
        // Make all validation calls succeed
        axios.post.mockResolvedValue({ data: { valid: true } });
        render(<App />);

        // First guess: 'a----' to set 'a' as correct
        await typeKeys('axxxx{Enter}');
        act(() => {
            jest.advanceTimersByTime(1500);
        });
        const aKey = screen.getByRole('button', { name: 'A' });
        expect(aKey).toHaveClass('correct');

        // Second guess places 'a' in a non-matching position; it should NOT downgrade 'correct'
        await typeKeys('baaaa{Enter}');
        act(() => {
            jest.advanceTimersByTime(1500);
        });
        expect(aKey).toHaveClass('correct');
    });

    test('clears prior messages after a non-final valid guess', async () => {
        jest.useFakeTimers();
        axios.get.mockResolvedValueOnce({ data: { word: 'apple' } });
        axios.post.mockResolvedValue({ data: { valid: true } });
        render(<App />);

        // Trigger a short-guess message
        await typeKeys('app{Enter}');
        expect(screen.getByText(/Guess must be 5 letters/i)).toBeInTheDocument();

        // Now submit a valid, non-final guess which should clear messages after flipDelay
        await typeKeys('plane{Enter}');
        // advance timers by flipDelay (300 * 5 = 1500ms)
        act(() => {
            jest.advanceTimersByTime(1500);
        });

        await waitFor(() => expect(screen.queryByText(/Guess must be 5 letters/i)).not.toBeInTheDocument());
    });

    test('opens stats modal when stats button clicked', async () => {
        axios.get.mockResolvedValueOnce({ data: { word: 'apple' } });
        await act(async () => {
            render(<App />);
        });

        const statsButton = screen.getByLabelText('Statistics');
        await act(async () => {
            fireEvent.click(statsButton);
        });

        expect(await screen.findByText('Statistics')).toBeInTheDocument();
        // Close the modal to exercise the onClose arrow and state update
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: '×' }));
        });
        await waitFor(() => expect(screen.queryByText('Statistics')).not.toBeInTheDocument());
    });

    test('calls updateStats with win=true when guessing the word', async () => {
        jest.useFakeTimers();
        const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(0);
        try {
            axios.get.mockResolvedValueOnce({ data: { word: 'apple' } });
            axios.post.mockResolvedValueOnce({ data: { valid: true } });
            render(<App />);
            await typeKeys('apple{Enter}');
            await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
            act(() => {
                jest.advanceTimersByTime(2000);
            });
            expect(updateStats).toHaveBeenCalledWith(true, 1, 0, 5);
        } finally {
            nowSpy.mockRestore();
        }
    });

    test('calls updateStats with win=false after max attempts (loss)', async () => {
        jest.useFakeTimers();
        axios.get.mockResolvedValue({ data: { word: 'apple' } });
        axios.post.mockResolvedValue({ data: { valid: true } });
        render(<App />);
        const guesses = ['plane', 'plane', 'plane', 'plane', 'plane', 'plane'];
        for (const [i, g] of guesses.entries()) {
            await typeKeys(g + '{Enter}');
            await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(i + 1));
        }
        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(updateStats).toHaveBeenCalledWith(false, 6, null, 5);
        expect(screen.getByText(/Game over! The word was apple\./i)).toBeInTheDocument();
    });
});
