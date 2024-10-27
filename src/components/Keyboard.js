import React from 'react';

const Keyboard = ({ setCurrentGuess, currentGuess }) => {
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");

    const handleKeyPress = (letter) => {
        setCurrentGuess((prev) => (prev + letter).slice(0, 5));
    };

    return (
        <div className="keyboard">
            {letters.map((letter) => (
                <button
                    key={letter}
                    onClick={() => handleKeyPress(letter)}
                    className="key"
                >
                    {letter}
                </button>
            ))}
            <button onClick={() => setCurrentGuess("")} className="key">Clear</button>
        </div>
    );
};

export default Keyboard;