import React, { useState, useEffect } from 'react';
import WordGrid from './components/WordGrid.jsx';
import Keyboard from './components/Keyboard.jsx';
import StatsModal from './components/StatsModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import Alert from './components/Alert.jsx';
import { useNerdleGame } from './game/useNerdleGame';
import './App.css';

const App = () => {
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
  const {
    targetWord,
    attempts,
    currentGuess,
    message,
    letterStatuses,
    handleKeyPress,
    clearMessage,
  } = useNerdleGame(wordLength);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('wordLength', String(wordLength));
  }, [wordLength]);

  useEffect(() => {
    setIsStatsOpen(false);
  }, [wordLength]);

  useEffect(() => {
    const handleKeyDown = (event) => handleKeyPress(event.key);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  return (
    <main className="game-container" aria-label="Nerdle game">
      <div className="header">
        <h1>Nerdle</h1>
        <button
          className="stats-button"
          onClick={() => setIsStatsOpen(true)}
          aria-label="Statistics"
        >
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
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        wordLength={wordLength}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onToggleTheme={() =>
          setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
        }
        wordLength={wordLength}
        onWordLengthChange={(len) => setWordLength(len)}
      />
      <Alert
        isOpen={!!message}
        message={message}
        onClose={clearMessage}
        duration={3000}
      />
      <div className="game-content">
        <WordGrid
          attempts={attempts}
          currentGuess={currentGuess}
          targetWord={targetWord}
          wordLength={wordLength}
        />
      </div>
      <Keyboard onKeyPress={handleKeyPress} letterStatuses={letterStatuses} />
      <footer className="site-footer">
        Made by{' '}
        <a
          href="https://nathanzimmerman.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Nathan Zimmerman
        </a>
      </footer>
    </main>
  );
};

export default App;
