import React, { useEffect, useState } from 'react';
import '../styles/WordGrid.css';

const WordGrid = ({ attempts, currentGuess, targetWord, wordLength = 5 }) => {
    const totalRows = 6;
    const [flippedLetters, setFlippedLetters] = useState([]);
    const [persistedStatuses, setPersistedStatuses] = useState({});
    const [flippingRow, setFlippingRow] = useState(null);

    useEffect(() => {
        setFlippedLetters([]);
        setPersistedStatuses({});
        setFlippingRow(null);
    }, [wordLength, targetWord]);

    useEffect(() => {
        if (attempts.length > 0) {
            const rowIndex = attempts.length - 1;
            setFlippingRow(rowIndex);
            setFlippedLetters([]); // Reset flipped letters for the new row
            let delay = 0;

            for (let i = 0; i < wordLength; i++) {
                setTimeout(() => {
                    setFlippedLetters((prev) => [...prev, i]);
                }, delay);
                delay += 300; // Delay between flips
            }
        }
    }, [attempts, wordLength]);

    const getLetterStatus = (letter, index) => {
        if (targetWord[index] === letter) return "correct";
        if (targetWord.includes(letter)) return "present";
        return "absent";
    };

    useEffect(() => {
        if (flippedLetters.length === wordLength && flippingRow !== null) {
            const newStatuses = { ...persistedStatuses };

            attempts[flippingRow].split('').forEach((letter, index) => {
                const status = getLetterStatus(letter, index);
                if (!newStatuses[flippingRow]) {
                    newStatuses[flippingRow] = [];
                }
                newStatuses[flippingRow][index] = status;
            });

            setPersistedStatuses(newStatuses);
            setFlippingRow(null); // Reset flipping row
        }
    }, [flippedLetters, attempts, flippingRow, getLetterStatus, persistedStatuses, wordLength]);

    const getFlipClasses = (statusClass, rowIndex, letterIndex) => {
        const isPersisted = persistedStatuses[rowIndex]?.[letterIndex];
        if (isPersisted) return `${statusClass}-final`;
        if (flippingRow === rowIndex && flippedLetters.includes(letterIndex)) {
            return `flip ${statusClass}-initial ${statusClass}-final`;
        }
        return ""; // No animation
    };

    return (
        /* Outer container: fills available flexible space in parent, centers content */
        <div className="word-grid-container" style={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            display: 'flex',
            alignItems: 'center', /* Center vertically */
            justifyContent: 'center', /* Center horizontally */
            /* overflow: 'hidden', Removed to prevent clipping borders */
            padding: '10px' /* Prevent edge clipping */
        }}>
            {/* Inner container: maintains aspect ratio and clamps sizing */}
            <div className="word-grid word-grid-aspect" style={{
                width: '100%',
                maxWidth: '350px',
                aspectRatio: '5/6',
                maxHeight: '92%', /* Balanced buffer for spacing */
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                {Array.from({ length: totalRows }).map((_, rowIndex) => {
                    const isCurrentRow = rowIndex === attempts.length;
                    const guess = isCurrentRow ? currentGuess : attempts[rowIndex] || "";

                    return (
                        <div key={rowIndex} className="word-row">
                            {Array.from({ length: wordLength }).map((_, letterIndex) => {
                                const letter = guess[letterIndex] || "";
                                const statusClass = !isCurrentRow && letter ? getLetterStatus(letter, letterIndex) : "";
                                const filledClass = letter ? "letter-filled" : "letter-empty";
                                const flipClass = statusClass
                                    ? getFlipClasses(statusClass, rowIndex, letterIndex)
                                    : "";

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
