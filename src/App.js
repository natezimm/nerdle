import React, { useState, useEffect } from 'react';
import { techWords } from './words';
import WordGrid from './components/WordGrid';
import Keyboard from './components/Keyboard';
import './App.css';

const App = () => {
  const [targetWord, setTargetWord] = useState("");
  const [currentGuess, setCurrentGuess] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [message, setMessage] = useState("");
  const maxAttempts = 6;

  useEffect(() => {
    setTargetWord(techWords[Math.floor(Math.random() * techWords.length)]);
  }, []);

  const handleGuess = () => {
    if (currentGuess.length !== targetWord.length) {
      setMessage("Enter a full word!");
      return;
    }

    if (currentGuess.toLowerCase() === targetWord) {
      setMessage("You guessed correctly!");
    } else if (attempts.length + 1 >= maxAttempts) {
      setMessage(`Out of attempts! The word was ${targetWord}`);
    } else {
      setMessage("Try again!");
      setAttempts([...attempts, currentGuess]);
    }

    setCurrentGuess("");
  };

  return (
      <div className="game-container">
        <h1>Tech Word Guess</h1>
        <WordGrid attempts={attempts} targetWord={targetWord} />
        <input
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value)}
            maxLength={targetWord.length}
            placeholder="Guess the tech word"
            className="guess-input"
        />
        <button onClick={handleGuess} className="guess-button">Submit</button>
        <p>{message}</p>
        <Keyboard setCurrentGuess={setCurrentGuess} currentGuess={currentGuess} />
      </div>
  );
};

export default App;