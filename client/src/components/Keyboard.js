import React from 'react';
import '../styles/Keyboard.css';

const Keyboard = ({ onKeyPress, letterStatuses }) => {
    const firstRow = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
    const secondRow = ["a", "s", "d", "f", "g", "h", "j", "k", "l"];
    const thirdRow = ["Enter", "z", "x", "c", "v", "b", "n", "m", "Backspace"];

    const getClassName = (key) => {
        return `key ${letterStatuses[key] || ''}`;
    };

    return (
        <div className="keyboard">
            <div className="keyboard-row">
                {firstRow.map((key) => (
                    <button key={key} onClick={() => onKeyPress(key)} className={getClassName(key)}>
                        {key.toUpperCase()}
                    </button>
                ))}
            </div>
            <div className="keyboard-row">
                <div className="half-spacer"></div>
                {secondRow.map((key) => (
                    <button key={key} onClick={() => onKeyPress(key)} className={getClassName(key)}>
                        {key.toUpperCase()}
                    </button>
                ))}
                <div className="half-spacer"></div>
            </div>
            <div className="keyboard-row">
                <button onClick={() => onKeyPress("Enter")} className="key key-wide">Enter</button>
                {thirdRow.slice(1, -1).map((key) => (
                    <button key={key} onClick={() => onKeyPress(key)} className={getClassName(key)}>
                        {key.toUpperCase()}
                    </button>
                ))}
                <button onClick={() => onKeyPress("Backspace")} className="key key-wide key-backspace">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="20"
                        viewBox="0 0 24 24"
                        width="20"
                        className="backspace-icon"
                    >
                        <path fill="currentColor"
                              d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Keyboard;