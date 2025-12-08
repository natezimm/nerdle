export const getStats = () => {
    const stats = localStorage.getItem('nerdle-stats');
    if (stats) {
        return JSON.parse(stats);
    }
    return {
        totalGames: 0,
        wins: 0,
        currentStreak: 0,
        longestStreak: 0,
        fastestSolveTime: null, // in milliseconds
        fewestGuesses: null,
    };
};

export const updateStats = (isWin, guessCount, timeTaken) => {
    const stats = getStats();
    stats.totalGames += 1;

    if (isWin) {
        stats.wins += 1;
        stats.currentStreak += 1;
        if (stats.currentStreak > stats.longestStreak) {
            stats.longestStreak = stats.currentStreak;
        }

        // Update fastest solve time
        if (stats.fastestSolveTime === null || timeTaken < stats.fastestSolveTime) {
            stats.fastestSolveTime = timeTaken;
        }

        // Update fewest guesses
        if (stats.fewestGuesses === null || guessCount < stats.fewestGuesses) {
            stats.fewestGuesses = guessCount;
        }
    } else {
        stats.currentStreak = 0;
    }

    localStorage.setItem('nerdle-stats', JSON.stringify(stats));
    return stats;
};

export const formatTime = (ms) => {
    if (ms === null) return "--";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
