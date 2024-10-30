import React from 'react';

const Keyboard = ({ onKeyPress }) => {
    const firstRow = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
    const secondRow = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];
    const thirdRow = ["Enter", "z", "x", "c", "v", "b", "n", "m", "Backspace"];

    return (
        <div className="keyboard">
            <div className="keyboard-row">
                {firstRow.map((key) => (
                    <button key={key} onClick={() => onKeyPress(key)} className="key">
                        {key.toUpperCase()}
                    </button>
                ))}
            </div>
            <div className="keyboard-row">
                <div className="half-spacer"></div>
                {secondRow.map((key) => (
                    <button key={key} onClick={() => onKeyPress(key)} className="key">
                        {key.toUpperCase()}
                    </button>
                ))}
                <div className="half-spacer"></div>
            </div>
            <div className="keyboard-row">
                <button onClick={() => onKeyPress("Enter")} className="key key-wide">Enter</button>
                {thirdRow.slice(1, -1).map((key) => (
                    <button key={key} onClick={() => onKeyPress(key)} className="key">
                        {key.toUpperCase()}
                    </button>
                ))}
                <button onClick={() => onKeyPress("Backspace")} className="key key-wide">←</button>
            </div>
        </div>
    );
};

export default Keyboard;