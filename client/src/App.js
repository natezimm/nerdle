import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import WordGrid from './components/WordGrid';
import Keyboard from './components/Keyboard';
import StatsModal from './components/StatsModal';
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
    const [startTime, setStartTime] = useState(null);
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
        return 'light';
    });
    const maxAttempts = 6;

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        axios.get(`${apiUrl}/api/words/random`)
            .then((response) => {
                setTargetWord(response.data.word);
                setStartTime(Date.now());
            })
            .catch((error) => {
                console.error("Error fetching the word:", error);
                setMessage("Failed to fetch the word. Please try again later.");
            });
    }, [apiUrl]);

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
        if (currentGuess.length !== 5) {
            setMessage("Guess must be 5 letters.");
            return;
        }

        axios.post(`${apiUrl}/api/words/validate`, { word: currentGuess })
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
                        updateStats(true, attempts.length + 1, timeTaken);
                        setMessage("Congratulations! You've guessed the word.");
                        setGameOver(true);
                        setIsStatsOpen(true);
                    }, flipDelay);
                } else if (attempts.length + 1 >= maxAttempts) {
                    setTimeout(() => {
                        updateStats(false, maxAttempts, null);
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
    }, [currentGuess, targetWord, attempts.length, maxAttempts, updateLetterStatuses, apiUrl, startTime]);
    const handleKeyPress = useCallback((key) => {
        if (gameOver) return;

        if (key === "Enter") {
            submitGuess();
        } else if (key === "Backspace") {
            setCurrentGuess((prev) => prev.slice(0, -1));
        } else if (/^[a-zA-Z]$/.test(key) && currentGuess.length < 5) {
            setCurrentGuess((prev) => prev + key.toLowerCase()); // Add the key to the current guess
        }
    }, [submitGuess, currentGuess, gameOver]);

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
                    className="theme-button"
                    onClick={() => setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))}
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    <i className={theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
                </button>
            </div>
            <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
            <WordGrid attempts={attempts} currentGuess={currentGuess} targetWord={targetWord} />
            <p>{message}</p>
            <Keyboard onKeyPress={handleKeyPress} letterStatuses={letterStatuses} />        </div>
    );
};

export default App;
