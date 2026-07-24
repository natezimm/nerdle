import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { updateStats } from './utils/stats';
import App from './App.jsx';

vi.mock('axios');
vi.mock('./utils/stats', async () => {
  const actual = await vi.importActual('./utils/stats');
  return {
    ...actual,
    updateStats: vi.fn(),
  };
});
const parseKeys = (keys) => keys.match(/(\{[^}]+\}|.)/g) || [];
const typeKeys = async (keys) => {
  for (const token of parseKeys(keys)) {
    const key = token.replace(/^{|}$/g, '');
    await act(async () => {
      fireEvent.keyDown(window, { key });
    });
  }
};
const guessCalls = () =>
  axios.post.mock.calls.filter(([url]) => url.includes('/guesses'));

const scoresByWord = {
  apple: ['correct', 'correct', 'correct', 'correct', 'correct'],
  plane: ['present', 'present', 'present', 'absent', 'correct'],
  allee: ['correct', 'present', 'absent', 'absent', 'correct'],
  axxxx: ['correct', 'absent', 'absent', 'absent', 'absent'],
  baaaa: ['absent', 'present', 'absent', 'absent', 'absent'],
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    let attemptCount = 0;
    axios.post.mockImplementation((url, body) => {
      if (url === '/api/games') {
        return Promise.resolve({
          data: { gameId: 'game-1', wordLength: 5, maxAttempts: 6 },
        });
      }

      attemptCount += 1;
      const won = body.word === 'apple';
      const complete = won || attemptCount >= 6;
      return Promise.resolve({
        data: {
          valid: true,
          score: scoresByWord[body.word] ?? Array(5).fill('absent'),
          won,
          complete,
          attemptsRemaining: 6 - attemptCount,
          ...(complete ? { answer: 'apple' } : {}),
        },
      });
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('starts a game using the default API path', async () => {
    const previousApiUrl = import.meta.env.VITE_API_URL;
    delete import.meta.env.VITE_API_URL;

    render(<App />);

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        '/api/games',
        { wordLength: 5 },
        expect.objectContaining({ signal: expect.any(Object) })
      )
    );

    if (previousApiUrl === undefined) {
      delete import.meta.env.VITE_API_URL;
    } else {
      import.meta.env.VITE_API_URL = previousApiUrl;
    }
  });

  test('shows an error message when starting a game fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('network failure'));
    render(<App />);
    expect(
      await screen.findByText(/Failed to start a game/i)
    ).toBeInTheDocument();
  });

  test('rejects guesses that are too short', async () => {
    render(<App />);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await typeKeys('app{Enter}');
    expect(screen.getByText(/Guess must be 5 letters/i)).toBeInTheDocument();
    expect(guessCalls()).toHaveLength(0);
  });

  test('shows invalid word message when the guess API marks it invalid', async () => {
    axios.post.mockImplementation((url) =>
      Promise.resolve({
        data:
          url === '/api/games'
            ? { gameId: 'game-1', wordLength: 5, maxAttempts: 6 }
            : { valid: false },
      })
    );
    render(<App />);
    await typeKeys('apple{Enter}');
    expect(
      await screen.findByText(/Invalid word\. Try again\./i)
    ).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith(
      '/api/games/game-1/guesses',
      { word: 'apple' },
      expect.objectContaining({ signal: expect.any(Object) })
    );
  });

  test('displays retry message when the guess API throws', async () => {
    axios.post.mockImplementation((url) => {
      if (url === '/api/games') {
        return Promise.resolve({
          data: { gameId: 'game-1', wordLength: 5, maxAttempts: 6 },
        });
      }
      return Promise.reject(new Error('guess failure'));
    });
    render(<App />);
    await typeKeys('apple{Enter}');
    expect(
      await screen.findByText(/Error validating the word/i)
    ).toBeInTheDocument();
  });

  test('opens stats, shows success message, and stops accepting input after winning', async () => {
    vi.useFakeTimers();
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(0);
    try {
      render(<App />);
      await typeKeys('apple{Enter}');
      await waitFor(() => expect(guessCalls()).toHaveLength(1));
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(await screen.findByText(/Congratulations!/i)).toBeInTheDocument();
      expect(screen.queryByText('Statistics')).not.toBeInTheDocument();
      expect(guessCalls()).toHaveLength(1);
      await typeKeys('{Enter}');
      expect(guessCalls()).toHaveLength(1);
    } finally {
      nowSpy.mockRestore();
    }
  });

  test('backspace removes letters from the current guess', async () => {
    const { container } = render(<App />);
    await typeKeys('ab');
    const letterCells = container.querySelectorAll(
      '.word-grid .word-row:first-child .letter'
    );
    expect(letterCells[0]).toHaveTextContent('a');
    expect(letterCells[1]).toHaveTextContent('b');
    await typeKeys('{Backspace}');
    expect(letterCells[0]).toHaveTextContent('a');
    expect(letterCells[1]).toHaveTextContent('');
  });

  test('updates keyboard letter statuses after a guess', async () => {
    vi.useFakeTimers();
    render(<App />);
    await typeKeys('plane{Enter}');
    // updateLetterStatuses uses a 1500ms timeout
    act(() => {
      vi.advanceTimersByTime(1500);
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
    vi.useFakeTimers();
    render(<App />);
    await typeKeys('allee{Enter}');
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    const aKey = screen.getByRole('button', { name: 'A' });
    const lKey = screen.getByRole('button', { name: 'L' });
    const eKey = screen.getByRole('button', { name: 'E' });
    expect(aKey).toHaveClass('correct');
    expect(lKey).toHaveClass('present');
    expect(eKey).toHaveClass('correct');
  });

  test("doesn't downgrade 'correct' statuses on later guesses", async () => {
    vi.useFakeTimers();
    render(<App />);

    // First guess: 'a----' to set 'a' as correct
    await typeKeys('axxxx{Enter}');
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    const aKey = screen.getByRole('button', { name: 'A' });
    expect(aKey).toHaveClass('correct');

    // Second guess places 'a' in a non-matching position; it should NOT downgrade 'correct'
    await typeKeys('baaaa{Enter}');
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(aKey).toHaveClass('correct');
  });

  test('clears prior messages after a non-final valid guess', async () => {
    vi.useFakeTimers();
    render(<App />);

    // Trigger a short-guess message
    await typeKeys('app{Enter}');
    expect(screen.getByText(/Guess must be 5 letters/i)).toBeInTheDocument();

    // Now submit a valid, non-final guess which should clear messages after flipDelay
    await typeKeys('plane{Enter}');
    // advance timers by flipDelay (300 * 5 = 1500ms)
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await waitFor(() =>
      expect(
        screen.queryByText(/Guess must be 5 letters/i)
      ).not.toBeInTheDocument()
    );
  });

  test('opens stats modal when stats button clicked', async () => {
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
      fireEvent.click(screen.getByRole('button', { name: 'Close statistics' }));
    });
    await waitFor(() =>
      expect(screen.queryByText('Statistics')).not.toBeInTheDocument()
    );
  });

  test('calls updateStats with win=true when guessing the word', async () => {
    vi.useFakeTimers();
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(0);
    try {
      render(<App />);
      await typeKeys('apple{Enter}');
      await waitFor(() => expect(guessCalls()).toHaveLength(1));
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(updateStats).toHaveBeenCalledWith(true, 1, 0, 5);
    } finally {
      nowSpy.mockRestore();
    }
  });

  test('calls updateStats with win=false after max attempts (loss)', async () => {
    vi.useFakeTimers();
    render(<App />);
    const guesses = ['plane', 'plane', 'plane', 'plane', 'plane', 'plane'];
    for (const [i, g] of guesses.entries()) {
      await typeKeys(g + '{Enter}');
      await waitFor(() => expect(guessCalls()).toHaveLength(i + 1));
      act(() => {
        vi.advanceTimersByTime(1500);
      });
    }
    expect(updateStats).toHaveBeenCalledWith(false, 6, null, 5);
    expect(
      screen.getByText(/Game over! The word was apple\./i)
    ).toBeInTheDocument();
  });

  test('renders footer with attribution link to nathanzimmerman.com', async () => {
    render(<App />);
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    const footer = document.querySelector('.site-footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent('Made by Nathan Zimmerman');

    const link = footer.querySelector('a');
    expect(link).toHaveAttribute('href', 'https://nathanzimmerman.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent('Nathan Zimmerman');
  });
});
