import React from 'react';
import './SettingsModal.css';

const SettingsModal = ({
    isOpen,
    onClose,
    theme,
    onToggleTheme,
    wordLength,
    onWordLengthChange,
}) => {
    if (!isOpen) return null;

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay" onMouseDown={handleOverlayClick}>
            <div className="modal-content" role="dialog" aria-modal="true" aria-label="Settings">
                <div className="modal-header">
                    <h2>Settings</h2>
                    <button className="close-button" onClick={onClose} aria-label="Close settings">
                        &times;
                    </button>
                </div>

                <div className="settings-section">
                    <div className="settings-row">
                        <div className="settings-label">Theme</div>
                        <button
                            className="settings-action"
                            onClick={onToggleTheme}
                            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            <i className={theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
                            <span className="settings-action-text">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                        </button>
                    </div>

                    <div className="settings-row settings-row-multi">
                        <div className="settings-label">Word Length</div>
                        <div className="settings-options" role="radiogroup" aria-label="Word length">
                            {[4, 5, 6].map((len) => (
                                <button
                                    key={len}
                                    type="button"
                                    className={`settings-option ${wordLength === len ? 'selected' : ''}`}
                                    onClick={() => onWordLengthChange(len)}
                                    aria-pressed={wordLength === len}
                                >
                                    {len}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;

