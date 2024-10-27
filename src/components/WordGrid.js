import React from 'react';

const WordGrid = ({ attempts, targetWord }) => {
    const getLetterStatus = (letter, index) => {
        if (targetWord[index] === letter) return "correct";
        if (targetWord.includes(letter)) return "present";
        return "absent";
    };

    return (
        <div className="word-grid">
            {attempts.map((attempt, i) => (
                <div key={i} className="word-row">
                    {attempt.split("").map((letter, j) => (
                        <span key={j} className={`letter ${getLetterStatus(letter, j)}`}>
                            {letter}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default WordGrid;