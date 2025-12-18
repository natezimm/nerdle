const STORAGE_KEY = 'nerdle-stats';
const SUPPORTED_WORD_LENGTHS = [4, 5, 6];
const DEFAULT_WORD_LENGTH = 5;

const createEmptyStats = () => ({
    totalGames: 0,
    wins: 0,
    currentStreak: 0,
    longestStreak: 0,
    fastestSolveTime: null, // in milliseconds
    fewestGuesses: null,
});

const createEmptyAllStats = () => ({
    version: 2,
    byLength: Object.fromEntries(
        SUPPORTED_WORD_LENGTHS.map((length) => [String(length), createEmptyStats()])
    ),
});

const normalizeLengthKey = (wordLength) => {
    const parsed = Number(wordLength);
    if (SUPPORTED_WORD_LENGTHS.includes(parsed)) return String(parsed);
    return String(DEFAULT_WORD_LENGTH);
};

const loadAllStats = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createEmptyAllStats();

    try {
        const parsed = JSON.parse(stored);

        // v2+ format
        if (parsed && typeof parsed === 'object' && parsed.byLength && typeof parsed.byLength === 'object') {
            const normalized = createEmptyAllStats();
            for (const length of SUPPORTED_WORD_LENGTHS) {
                const key = String(length);
                const maybeStats = parsed.byLength[key];
                normalized.byLength[key] = {
                    ...createEmptyStats(),
                    ...(maybeStats && typeof maybeStats === 'object' ? maybeStats : {}),
                };
            }
            return normalized;
        }

        // legacy format (single stats object)
        if (parsed && typeof parsed === 'object' && typeof parsed.totalGames === 'number') {
            const migrated = createEmptyAllStats();
            migrated.byLength[String(DEFAULT_WORD_LENGTH)] = {
                ...createEmptyStats(),
                ...parsed,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
            return migrated;
        }
    } catch {
        // Fall through to reset
    }

    const reset = createEmptyAllStats();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
    return reset;
};

export const getStats = (wordLength = DEFAULT_WORD_LENGTH) => {
    const allStats = loadAllStats();
    const key = normalizeLengthKey(wordLength);
    return allStats.byLength[key] ?? createEmptyStats();
};

export const updateStats = (isWin, guessCount, timeTaken, wordLength = DEFAULT_WORD_LENGTH) => {
    const allStats = loadAllStats();
    const key = normalizeLengthKey(wordLength);
    const stats = allStats.byLength[key] ?? createEmptyStats();

    stats.totalGames += 1;

    if (isWin) {
        stats.wins += 1;
        stats.currentStreak += 1;
        if (stats.currentStreak > stats.longestStreak) {
            stats.longestStreak = stats.currentStreak;
        }

        if (stats.fastestSolveTime === null || timeTaken < stats.fastestSolveTime) {
            stats.fastestSolveTime = timeTaken;
        }

        if (stats.fewestGuesses === null || guessCount < stats.fewestGuesses) {
            stats.fewestGuesses = guessCount;
        }
    } else {
        stats.currentStreak = 0;
    }

    allStats.byLength[key] = stats;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allStats));
    return stats;
};

export const formatTime = (ms) => {
    if (ms === null) return "--";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
