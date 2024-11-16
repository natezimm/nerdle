import React, { useEffect, useState } from 'react';

const WordGrid = ({ attempts, currentGuess, targetWord }) => {
    const totalRows = 6;
    const wordLength = 5;
    const [flippedLetters, setFlippedLetters] = useState([]);
    const [persistedStatuses, setPersistedStatuses] = useState({});
    const [flippingRow, setFlippingRow] = useState(null);

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
    }, [attempts]);

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
    }, [flippedLetters, attempts, flippingRow]);

    const getLetterStatus = (letter, index) => {
        if (targetWord[index] === letter) return "correct";
        if (targetWord.includes(letter)) return "present";
        return "absent";
    };

    const getFlipClasses = (statusClass, rowIndex, letterIndex) => {
        const isPersisted = persistedStatuses[rowIndex]?.[letterIndex];
        if (isPersisted) return `${statusClass}-final`;
        if (flippingRow === rowIndex && flippedLetters.includes(letterIndex)) {
            return `flip ${statusClass}-initial ${statusClass}-final`;
        }
        return ""; // No animation
    };

    return (
        <div className="word-grid">
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
    );
};

export default WordGrid;