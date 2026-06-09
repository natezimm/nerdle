import React, { useEffect, useMemo, useState } from 'react';
import { scoreGuess } from '../game/scoring';
import '../styles/WordGrid.css';

const WordGrid = ({ attempts, currentGuess, targetWord, wordLength = 5 }) => {
  const totalRows = 6;
  const [flippedLetters, setFlippedLetters] = useState([]);
  const [flippingRow, setFlippingRow] = useState(null);

  const scoredAttempts = useMemo(() => {
    if (!targetWord) return [];
    return attempts.map((attempt) => scoreGuess(targetWord, attempt));
  }, [attempts, targetWord]);

  useEffect(() => {
    setFlippedLetters([]);
    setFlippingRow(null);
  }, [wordLength, targetWord]);

  useEffect(() => {
    if (attempts.length === 0) return undefined;

    const timers = [];
    const rowIndex = attempts.length - 1;
    setFlippingRow(rowIndex);
    setFlippedLetters([]);

    for (let i = 0; i < wordLength; i++) {
      timers.push(
        setTimeout(() => {
          setFlippedLetters((prev) => [...prev, i]);
        }, i * 300)
      );
    }

    timers.push(
      setTimeout(() => {
        setFlippingRow(null);
      }, wordLength * 300)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [attempts.length, wordLength]);

  const getFlipClasses = (statusClass, rowIndex, letterIndex) => {
    if (flippingRow === rowIndex && flippedLetters.includes(letterIndex)) {
      return `flip ${statusClass}-initial ${statusClass}-final`;
    }
    if (flippingRow === rowIndex) return '';
    return `${statusClass}-final`;
  };

  return (
    /* Outer container: fills available flexible space in parent, centers content */
    <div
      className="word-grid-container"
      style={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        display: 'flex',
        alignItems: 'center' /* Center vertically */,
        justifyContent: 'center' /* Center horizontally */,
        /* overflow: 'hidden', Removed to prevent clipping borders */
        padding: '10px' /* Prevent edge clipping */,
      }}
    >
      {/* Inner container: maintains aspect ratio and clamps sizing */}
      <div
        className="word-grid word-grid-aspect"
        style={{
          width: '100%',
          maxWidth: '350px',
          aspectRatio: '5/6',
          maxHeight: '92%' /* Balanced buffer for spacing */,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {Array.from({ length: totalRows }).map((_, rowIndex) => {
          const isCurrentRow = rowIndex === attempts.length;
          const guess = isCurrentRow ? currentGuess : attempts[rowIndex] || '';

          return (
            <div key={rowIndex} className="word-row">
              {Array.from({ length: wordLength }).map((_, letterIndex) => {
                const letter = guess[letterIndex] || '';
                const statusClass =
                  !isCurrentRow && letter
                    ? scoredAttempts[rowIndex]?.[letterIndex]
                    : '';
                const filledClass = letter ? 'letter-filled' : 'letter-empty';
                const flipClass = statusClass
                  ? getFlipClasses(statusClass, rowIndex, letterIndex)
                  : '';

                return (
                  <span
                    key={letterIndex}
                    className={`letter ${filledClass} ${flipClass}`}
                  >
                    {letter}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WordGrid;
