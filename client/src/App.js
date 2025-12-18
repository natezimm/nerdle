import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import WordGrid from './components/WordGrid';
import Keyboard from './components/Keyboard';
import StatsModal from './components/StatsModal';
import SettingsModal from './components/SettingsModal';
import { updateStats } from './utils/stats';
import './App.css';

const App = () => {
    const [targetWord, setTargetWord] = useState("");
    const [attempts, setAttempts] = useState([]);
    const [currentGuess, setCurrentGuess] = useState("");
    const [message, setMessage] = useState("");
    const [letterStatuses, setLetterStatuses] = useState({});
    const [gameOver, setGameOver] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [wordLength, setWordLength] = useState(() => {
        const storedLength = Number(localStorage.getItem('wordLength'));
        if ([4, 5, 6].includes(storedLength)) return storedLength;
        return 5;
    });
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
        return 'light';
    });
    const maxAttempts = 6;

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('wordLength', String(wordLength));
    }, [wordLength]);

    useEffect(() => {
        setAttempts([]);
        setCurrentGuess("");
        setMessage("");
        setLetterStatuses({});
        setGameOver(false);
        setTargetWord("");
        setIsStatsOpen(false);

        axios.get(`/api/words/random?length=${wordLength}`)
            .then((response) => {
                setTargetWord(response.data.word);
                setStartTime(Date.now());
            })
            .catch((error) => {
                console.error("Error fetching the word:", error);
                setMessage("Failed to fetch the word. Please try again later.");
            });
    }, [wordLength]);

    const updateLetterStatuses = useCallback((guess) => {
        const newStatuses = { ...letterStatuses };
        const targetWordArray = targetWord.split('');

        setTimeout(() => {
            guess.split('').forEach((letter, index) => {
                if (targetWordArray[index] === letter) {
                    newStatuses[letter] = 'correct';
                } else if (targetWordArray.includes(letter)) {
                    if (newStatuses[letter] !== 'correct') {
                        newStatuses[letter] = 'present';
                    }
                } else {
                    newStatuses[letter] = 'absent';
                }
            });

            setLetterStatuses(newStatuses);
        }, 1500);
    }, [letterStatuses, targetWord]);

    const submitGuess = useCallback(() => {
        if (currentGuess.length !== wordLength) {
            setMessage(`Guess must be ${wordLength} letters.`);
            return;
        }

        axios.post('/api/words/validate', { word: currentGuess })
            .then((response) => {
                if (!response.data.valid) {
                    setMessage("Invalid word. Try again.");
                    return;
                }

                updateLetterStatuses(currentGuess);
                setAttempts((prevAttempts) => [...prevAttempts, currentGuess]);
                setCurrentGuess("");

                const flipDelay = 300 * currentGuess.length;

                if (currentGuess === targetWord) {
                    setTimeout(() => {
                        const timeTaken = Date.now() - startTime;
                        updateStats(true, attempts.length + 1, timeTaken, wordLength);
                        setMessage("Congratulations! You've guessed the word.");
                        setGameOver(true);
                        setIsStatsOpen(true);
                    }, flipDelay);
                } else if (attempts.length + 1 >= maxAttempts) {
                    setTimeout(() => {
                        updateStats(false, maxAttempts, null, wordLength);
                        setMessage(`Game over! The word was ${targetWord}.`);
                        setGameOver(true);
                        setIsStatsOpen(true);
                    }, flipDelay);
                } else {
                    setTimeout(() => {
                        setMessage("");
                    }, flipDelay);
                }
            })
            .catch((error) => {
                console.error("Error validating the word:", error);
                setMessage("Error validating the word. Please try again.");
            });
    }, [currentGuess, targetWord, attempts.length, maxAttempts, updateLetterStatuses, startTime, wordLength]);
    const handleKeyPress = useCallback((key) => {
        if (gameOver) return;

        if (key === "Enter") {
            submitGuess();
        } else if (key === "Backspace") {
            setCurrentGuess((prev) => prev.slice(0, -1));
        } else if (/^[a-zA-Z]$/.test(key) && currentGuess.length < wordLength) {
            setCurrentGuess((prev) => prev + key.toLowerCase()); // Add the key to the current guess
        }
    }, [submitGuess, currentGuess, gameOver, wordLength]);

    useEffect(() => {
        const handleKeyDown = (event) => handleKeyPress(event.key);
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyPress]);

    return (
        <div className="game-container">
            <div className="header">
                <h1>Nerdle</h1>
                <button className="stats-button" onClick={() => setIsStatsOpen(true)} aria-label="Statistics">
                    <i className="fa-solid fa-trophy"></i>
                </button>
                <button
                    className="settings-button"
                    onClick={() => setIsSettingsOpen(true)}
                    aria-label="Settings"
                >
                    <i className="fa-solid fa-gear"></i>
                </button>
            </div>
            <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} wordLength={wordLength} />
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                theme={theme}
                onToggleTheme={() => setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))}
                wordLength={wordLength}
                onWordLengthChange={(len) => setWordLength(len)}
            />
            <WordGrid attempts={attempts} currentGuess={currentGuess} targetWord={targetWord} wordLength={wordLength} />
            <p>{message}</p>
            <Keyboard onKeyPress={handleKeyPress} letterStatuses={letterStatuses} />        </div>
    );
};

export default App;
