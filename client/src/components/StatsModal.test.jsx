import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import StatsModal from './StatsModal.jsx';
import { formatTime, getStats } from '../utils/stats';

vi.mock('../utils/stats', () => ({
    getStats: vi.fn(),
    formatTime: vi.fn(),
}));

describe('StatsModal', () => {
    beforeEach(() => {
        getStats.mockClear();
        formatTime.mockClear();
    });

    test('does not render when closed', () => {
        render(<StatsModal isOpen={false} onClose={vi.fn()} />);
        expect(screen.queryByText('Statistics')).not.toBeInTheDocument();
    });

    test('displays stats and responds to close', async () => {
        getStats.mockReturnValue({
            totalGames: 5,
            wins: 3,
            currentStreak: 2,
            longestStreak: 4,
            fastestSolveTime: 45000,
            fewestGuesses: 4,
        });
        formatTime.mockReturnValue('0:45');
        const onClose = vi.fn();
        render(<StatsModal isOpen={true} onClose={onClose} />);
        expect(screen.getByText('Statistics')).toBeInTheDocument();
        const playedLabel = screen.getByText('Played');
        expect(playedLabel.previousElementSibling).toHaveTextContent('5');
        const winLabel = screen.getByText('Win %');
        expect(winLabel.previousElementSibling).toHaveTextContent('60%');
        const fastestLabel = screen.getByText('Fastest Time:');
        expect(fastestLabel.nextElementSibling).toHaveTextContent('0:45');
        const fewestLabel = screen.getByText('Fewest Guesses:');
        expect(fewestLabel.nextElementSibling).toHaveTextContent('4');
        fireEvent.click(screen.getByRole('button', { name: '×' }));
        expect(onClose).toHaveBeenCalled();
    });

    test('shows zero win rate and placeholder values when no games have been played', () => {
        getStats.mockReturnValue({
            totalGames: 0,
            wins: 0,
            currentStreak: 0,
            longestStreak: 0,
            fastestSolveTime: null,
            fewestGuesses: null,
        });
        formatTime.mockReturnValue('--');
        render(<StatsModal isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText('0%')).toBeInTheDocument();
        const fastestLabel = screen.getByText('Fastest Time:');
        expect(fastestLabel.nextElementSibling).toHaveTextContent('--');
        const fewestLabel = screen.getByText('Fewest Guesses:');
        expect(fewestLabel.nextElementSibling).toHaveTextContent('--');
        expect(formatTime).toHaveBeenCalledWith(null);
    });
});
