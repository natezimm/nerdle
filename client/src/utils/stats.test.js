import { formatTime, getStats, updateStats } from './stats';

describe('stats utility helpers', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('returns defaults when no stats are saved', () => {
        const stats = getStats();
        expect(stats).toEqual({
            totalGames: 0,
            wins: 0,
            currentStreak: 0,
            longestStreak: 0,
            fastestSolveTime: null,
            fewestGuesses: null,
        });

        const stored = {
            totalGames: 2,
            wins: 1,
            currentStreak: 1,
            longestStreak: 1,
            fastestSolveTime: 3000,
            fewestGuesses: 4,
        };
        localStorage.setItem('nerdle-stats', JSON.stringify(stored));
        expect(getStats()).toEqual(stored);
    });

    test('updateStats tracks wins, streaks, and bests', () => {
        const firstWin = updateStats(true, 4, 5000);
        expect(firstWin.totalGames).toBe(1);
        expect(firstWin.wins).toBe(1);
        expect(firstWin.currentStreak).toBe(1);
        expect(firstWin.longestStreak).toBe(1);
        expect(firstWin.fastestSolveTime).toBe(5000);
        expect(firstWin.fewestGuesses).toBe(4);

        const secondWin = updateStats(true, 3, 4000);
        expect(secondWin.totalGames).toBe(2);
        expect(secondWin.wins).toBe(2);
        expect(secondWin.currentStreak).toBe(2);
        expect(secondWin.longestStreak).toBe(2);
        expect(secondWin.fastestSolveTime).toBe(4000);
        expect(secondWin.fewestGuesses).toBe(3);
    });

    test('losses reset the current streak without altering bests', () => {
        updateStats(true, 3, 3000);
        const afterLoss = updateStats(false, 5, null);
        expect(afterLoss.totalGames).toBe(2);
        expect(afterLoss.wins).toBe(1);
        expect(afterLoss.currentStreak).toBe(0);
        expect(afterLoss.longestStreak).toBe(1);
        expect(afterLoss.fastestSolveTime).toBe(3000);
        expect(afterLoss.fewestGuesses).toBe(3);
    });

    test('better stats remain when win is worse than existing records', () => {
        const existingStats = {
            totalGames: 10,
            wins: 5,
            currentStreak: 0,
            longestStreak: 5,
            fastestSolveTime: 3000,
            fewestGuesses: 3,
        };
        localStorage.setItem('nerdle-stats', JSON.stringify(existingStats));

        const updated = updateStats(true, 4, 5000);
        expect(updated.totalGames).toBe(11);
        expect(updated.wins).toBe(6);
        expect(updated.currentStreak).toBe(1);
        expect(updated.longestStreak).toBe(5);
        expect(updated.fastestSolveTime).toBe(3000);
        expect(updated.fewestGuesses).toBe(3);
    });

    test('formats milliseconds into minutes and seconds and handles null', () => {
        expect(formatTime(null)).toBe('--');
        expect(formatTime(65000)).toBe('1:05');
        expect(formatTime(125000)).toBe('2:05');
    });
});
