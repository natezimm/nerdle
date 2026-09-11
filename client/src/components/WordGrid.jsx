import React, { useEffect, useState } from 'react';
import '../styles/WordGrid.css';

const WordGrid = ({
  attempts,
  currentGuess,
  wordLength = 5,
  isPlaying = true,
}) => {
  const totalRows = 6;
  const [flippedLetters, setFlippedLetters] = useState([]);
  const [flippingRow, setFlippingRow] = useState(null);

  useEffect(() => {
    setFlippedLetters([]);
    setFlippingRow(null);
  }, [wordLength]);

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
    <div className="word-grid-container">
      <div className={`word-grid word-grid-${wordLength}`}>
        {Array.from({ length: totalRows }).map((_, rowIndex) => {
          const isCurrentRow = rowIndex === attempts.length;
          const attempt = attempts[rowIndex];
          const guess = isCurrentRow ? currentGuess : attempt?.word || '';

          return (
            <div
              key={rowIndex}
              className={`word-row ${isCurrentRow && isPlaying ? 'word-row-active' : ''}`}
            >
              <span className="row-number" aria-hidden="true">
                {String(rowIndex + 1).padStart(2, '0')}
              </span>
              {Array.from({ length: wordLength }).map((_, letterIndex) => {
                const letter = guess[letterIndex] || '';
                const statusClass =
                  !isCurrentRow && letter ? attempt?.score?.[letterIndex] : '';
                const filledClass = letter ? 'letter-filled' : 'letter-empty';
                const cursorClass =
                  isCurrentRow && isPlaying && letterIndex === guess.length
                    ? 'letter-cursor'
                    : '';
                const flipClass = statusClass
                  ? getFlipClasses(statusClass, rowIndex, letterIndex)
                  : '';

                return (
                  <span
                    key={letterIndex}
                    className={`letter ${filledClass} ${flipClass} ${cursorClass}`}
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
