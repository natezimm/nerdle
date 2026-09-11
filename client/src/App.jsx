import React, { useState, useEffect } from 'react';
import WordGrid from './components/WordGrid.jsx';
import Keyboard from './components/Keyboard.jsx';
import StatsModal from './components/StatsModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import HintModal from './components/HintModal.jsx';
import Alert from './components/Alert.jsx';
import { useNerdleGame } from './game/useNerdleGame';
import {
  BOARD_STYLES,
  WINDOW_STYLES,
  readAppearance,
  resolveWindowStyle,
} from './utils/appearance';
import './App.css';
import './styles/FullTerminal.css';
import './styles/Responsive.css';

const App = () => {
  const [activeHint, setActiveHint] = useState('');
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
  const [windowStyle, setWindowStyle] = useState(() =>
    readAppearance('windowStyle', WINDOW_STYLES, 'auto')
  );
  const [boardStyle, setBoardStyle] = useState(() =>
    readAppearance('boardStyle', BOARD_STYLES, 'tiles')
  );
  const resolvedWindowStyle = resolveWindowStyle(windowStyle);
  const isFullTerminal = boardStyle === 'full-terminal';
  const {
    gameId,
    attempts,
    currentGuess,
    message,
    status,
    letterStatuses,
    handleKeyPress,
    clearMessage,
    startNewGame,
  } = useNerdleGame(wordLength);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('wordLength', String(wordLength));
  }, [wordLength]);

  useEffect(() => {
    localStorage.setItem('windowStyle', windowStyle);
    localStorage.setItem('boardStyle', boardStyle);
    document.documentElement.dataset.appearance = boardStyle;
  }, [windowStyle, boardStyle]);

  useEffect(() => {
    setIsStatsOpen(false);
    setActiveHint('');
  }, [wordLength]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        activeHint ||
        isStatsOpen ||
        isSettingsOpen ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.defaultPrevented
      ) {
        return;
      }
      handleKeyPress(event.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, isStatsOpen, isSettingsOpen, activeHint]);

  const requestNewGame = (nextLength = wordLength) => {
    if (['loading', 'validating', 'revealing'].includes(status)) return;
    if (
      status === 'playing' &&
      attempts.length > 0 &&
      !window.confirm(
        'Starting a new game will count this one as a loss. Start a new game?'
      )
    )
      return;
    setActiveHint('');
    startNewGame();
    setWordLength(nextLength);
  };

  const solved = attempts.at(-1)?.score.every((score) => score === 'correct');
  const attemptNumber = Math.min(
    attempts.length + (status === 'revealing' || status === 'complete' ? 0 : 1),
    6
  );
  const boardStatus = {
    loading: 'starting…',
    error: 'unavailable',
    validating: 'checking…',
    revealing: 'revealing…',
    complete: solved ? 'solved ✓' : 'finished',
  }[status];

  return (
    <main
      className="game-container"
      aria-label="Nerdle game"
      data-window-style={resolvedWindowStyle}
      data-app-style={isFullTerminal ? 'terminal' : 'default'}
    >
      <div className="header">
        <div className="header-brand">
          {resolvedWindowStyle === 'macos' && (
            <div className="terminal-dots" aria-hidden="true">
              <span className="dot dot-close"></span>
              <span className="dot dot-min"></span>
              <span className="dot dot-max"></span>
            </div>
          )}
          <h1 aria-label="Nerdle" className="brand-title">
            <span className="brand-bracket">{isFullTerminal ? '$' : '<'}</span>
            <span className="brand-name">Nerdle</span>
            {!isFullTerminal && (
              <>
                <span className="brand-slash"> /&gt;</span>
                <span className="brand-cursor" aria-hidden="true">
                  _
                </span>
              </>
            )}
          </h1>
        </div>
        <div className="header-actions">
          <button
            className="new-game-button"
            onClick={() => requestNewGame()}
            disabled={['loading', 'validating', 'revealing'].includes(status)}
          >
            <span aria-hidden="true">↻</span> New game
          </button>

          <button
            className="stats-button"
            onClick={() => setIsStatsOpen(true)}
            aria-label="Statistics"
          >
            {isFullTerminal ? 'stats' : <i className="fa-solid fa-trophy"></i>}
          </button>
          <button
            className="settings-button"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Settings"
          >
            {isFullTerminal ? 'config' : <i className="fa-solid fa-gear"></i>}
          </button>
          {resolvedWindowStyle === 'windows' && (
            <div className="windows-controls" aria-hidden="true">
              <svg width="48" height="12" viewBox="0 0 48 12" fill="none">
                <path d="M1 9h8M20 2h8v8h-8zM39 2l8 8m0-8-8 8" />
              </svg>
            </div>
          )}
        </div>
      </div>
      {['category', 'letter'].map((type) => (
        <HintModal
          key={`${gameId}-${type}`}
          gameId={gameId}
          type={type}
          isOpen={activeHint === type}
          onClose={() => setActiveHint('')}
        />
      ))}
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
        onWordLengthChange={(len) => {
          if (len !== wordLength) requestNewGame(len);
        }}
        wordLengthDisabled={['loading', 'validating', 'revealing'].includes(
          status
        )}
        windowStyle={windowStyle}
        onWindowStyleChange={setWindowStyle}
        boardStyle={boardStyle}
        onBoardStyleChange={setBoardStyle}
      />
      <Alert
        isOpen={!!message}
        message={message}
        onClose={clearMessage}
        duration={3000}
      />
      <div
        className="game-content"
        data-board-style={boardStyle === 'tiles' ? 'tiles' : 'terminal'}
      >
        <div className="board-toolbar">
          <span className="board-mode">
            <span className="visually-hidden">
              {wordLength}-letter tech word
            </span>
            <span aria-hidden="true">
              {boardStyle !== 'tiles' && (
                <span className="terminal-prompt">&gt; </span>
              )}
              letters<span className="code-punctuation">: </span>
              {wordLength}
            </span>
            <span className="board-topic" aria-hidden="true">
              {' // tech words'}
            </span>
          </span>
          <span className="board-status" role="status">
            {boardStatus ||
              `guess ${String(attemptNumber).padStart(2, '0')} / 06`}
          </span>
        </div>
        <div className="board-actions">
          <div
            className="board-hints"
            role="group"
            aria-labelledby="hints-label"
          >
            <span id="hints-label" className="hints-label">
              Hints
            </span>
            <div className="hint-options">
              <button
                className="hint-button"
                onClick={() => setActiveHint('category')}
                disabled={status !== 'playing'}
                aria-label="Category hint"
              >
                Category
              </button>
              <button
                className="hint-button"
                onClick={() => setActiveHint('letter')}
                disabled={status !== 'playing'}
                aria-label="Letter hint"
              >
                Letter
              </button>
            </div>
          </div>
        </div>
        <WordGrid
          attempts={attempts}
          currentGuess={currentGuess}
          wordLength={wordLength}
          isPlaying={status === 'playing' || status === 'validating'}
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
