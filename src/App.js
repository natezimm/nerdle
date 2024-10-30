import React, { useState, useEffect } from 'react';
import { techWords } from './words';
import WordGrid from './components/WordGrid';
import Keyboard from './components/Keyboard';
import './App.css';

const App = () => {
    const [targetWord, setTargetWord] = useState("");
    const [attempts, setAttempts] = useState([]);  // Stores all guessed words
    const [currentGuess, setCurrentGuess] = useState("");  // Stores the letters of the current guess
    const [message, setMessage] = useState("");
    const maxAttempts = 6;

    useEffect(() => {
        // Set a random target word when the game starts
        setTargetWord(techWords[Math.floor(Math.random() * techWords.length)]);
    }, []);

    // Handle keyboard input
    const handleKeyPress = (key) => {
        if (key === "Enter") {
            submitGuess();
        } else if (key === "Backspace") {
            setCurrentGuess((prev) => prev.slice(0, -1));
        } else if (/^[a-zA-Z]$/.test(key) && currentGuess.length < targetWord.length) {
            setCurrentGuess((prev) => prev + key.toLowerCase());
        }
    };

    const submitGuess = () => {
        if (currentGuess.length !== targetWord.length) {
            setMessage("Guess must be 5 letters.");
            return;
        }

        setAttempts([...attempts, currentGuess]);
        setCurrentGuess("");

        if (currentGuess === targetWord) {
            setMessage("Congratulations! You've guessed the word.");
        } else if (attempts.length + 1 >= maxAttempts) {
            setMessage(`Game over! The word was ${targetWord}.`);
        } else {
            setMessage("");
        }
    };

    // Listen for key presses
    useEffect(() => {
        const handleKeyDown = (event) => handleKeyPress(event.key);
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentGuess, attempts]);

    return (
        <div className="game-container">
            <h1>Tech Word Guess</h1>
            <WordGrid attempts={attempts} currentGuess={currentGuess} targetWord={targetWord} />
            <p>{message}</p>
            <Keyboard onKeyPress={handleKeyPress} />
        </div>
    );
};

export default App;