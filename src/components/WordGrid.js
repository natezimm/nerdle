import React from 'react';

const WordGrid = ({ attempts, currentGuess, targetWord }) => {
    const totalRows = 6;
    const wordLength = 5;

    const getLetterStatus = (letter, index) => {
        if (targetWord[index] === letter) return "correct";
        if (targetWord.includes(letter)) return "present";
        return "absent";
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

                            return (
                                <span key={letterIndex} className={`letter ${statusClass}`}>
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