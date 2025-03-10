import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import WordGrid from './components/WordGrid';
import Keyboard from './components/Keyboard';
import './App.css';

const App = () => {
    const [targetWord, setTargetWord] = useState("");
    const [attempts, setAttempts] = useState([]);
    const [currentGuess, setCurrentGuess] = useState("");
    const [message, setMessage] = useState("");
    const [letterStatuses, setLetterStatuses] = useState({});
    const [gameOver, setGameOver] = useState(false);
    const maxAttempts = 6;

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';

    useEffect(() => {
        // Fetch a random word from the backend when the game starts
        axios.get(`${apiUrl}/api/words/random`)
            .then((response) => {
                setTargetWord(response.data.word);
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
                    newStatuses[letter] = 'correct'; // Correct position
                } else if (targetWordArray.includes(letter)) {
                    if (newStatuses[letter] !== 'correct') {
                        newStatuses[letter] = 'present'; // Wrong position
                    }
                } else {
                    newStatuses[letter] = 'absent'; // Not in the word
                }
            });

            setLetterStatuses(newStatuses); // Update the letter statuses after delay
        }, 1500);
    }, [letterStatuses, targetWord]);

    const submitGuess = useCallback(() => {
        if (gameOver) return;

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

                if (currentGuess.length === 5) {
                    updateLetterStatuses(currentGuess);
                    setAttempts((prevAttempts) => [...prevAttempts, currentGuess]); // Ensures new attempt length
                    setCurrentGuess(""); // Reset the current guess for the next round

                    // Calculate delay for the flipping animation
                    const flipDelay = 300 * currentGuess.length; // Assuming 300ms delay per letter

                    if (currentGuess === targetWord) {
                        setTimeout(() => {
                            setMessage("Congratulations! You've guessed the word.");
                            setGameOver(true);
                        }, flipDelay); // Delay the message until all flips complete
                    } else if (attempts.length + 1 >= maxAttempts) {
                        setTimeout(() => {
                            setMessage(`Game over! The word was ${targetWord}.`);
                            setGameOver(true);
                        }, flipDelay); // Delay the "Game Over" message as well
                    } else {
                        setTimeout(() => {
                            setMessage(""); // Clear the message after flips
                        }, flipDelay);
                    }
                }
            })
            .catch((error) => {
                console.error("Error validating the word:", error);
                setMessage("Error validating the word. Please try again.");
            });
    }, [currentGuess, targetWord, attempts.length, maxAttempts, updateLetterStatuses, gameOver, apiUrl]);
    const handleKeyPress = useCallback((key) => {
        if (gameOver) return; // Prevent actions after the game is over

        if (key === "Enter") {
            submitGuess(); // Submit the current guess
        } else if (key === "Backspace") {
            setCurrentGuess((prev) => prev.slice(0, -1)); // Remove the last letter from the guess
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
            <h1>Nerdle</h1>
            <WordGrid attempts={attempts} currentGuess={currentGuess} targetWord={targetWord} />
            <p>{message}</p>
            <Keyboard onKeyPress={handleKeyPress} letterStatuses={letterStatuses} />        </div>
    );
};

export default App;