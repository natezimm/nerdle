import { useModalBehavior } from '../hooks/useModalBehavior';
import './SettingsModal.css';

const SettingsModal = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  wordLength,
  onWordLengthChange,
  wordLengthDisabled = false,
  windowStyle = 'auto',
  onWindowStyleChange,
  boardStyle = 'full-terminal',
  onBoardStyleChange,
}) => {
  const dialogRef = useModalBehavior({ isOpen, onClose });

  if (!isOpen) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="modal-header">
          <h2 id="settings-title" aria-label="Settings">
            Settings
          </h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close settings"
          >
            &times;
          </button>
        </div>

        <div className="settings-section">
          <div className="settings-row">
            <div className="settings-label">Theme</div>
            <button
              className="settings-action"
              onClick={onToggleTheme}
              aria-label={
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
            >
              <i
                className={
                  theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'
                }
              ></i>
              <span className="settings-action-text">
                {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>
          </div>

          <div className="settings-row settings-row-multi">
            <div className="settings-label">Word Length</div>
            <div
              className="settings-options"
              role="group"
              aria-label="Word length"
            >
              {[4, 5, 6].map((len) => (
                <button
                  key={len}
                  type="button"
                  className={`settings-option ${wordLength === len ? 'selected' : ''}`}
                  onClick={() => onWordLengthChange(len)}
                  disabled={wordLengthDisabled}
                  aria-pressed={wordLength === len}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-row settings-row-multi">
            <div className="settings-label" id="game-style-label">
              Game style
            </div>
            <div
              className="settings-options settings-options-wide"
              role="group"
              aria-labelledby="game-style-label"
            >
              {[
                ['full-terminal', 'Full', 'Full terminal'],
                ['terminal', 'Grid', 'Terminal grid'],
                ['tiles', 'Tiles', 'Tile board'],
              ].map(([value, label, description]) => (
                <button
                  key={value}
                  type="button"
                  className={`settings-option ${boardStyle === value ? 'selected' : ''}`}
                  onClick={() => onBoardStyleChange(value)}
                  aria-pressed={boardStyle === value}
                  title={description}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-row settings-row-multi">
            <div className="settings-label" id="window-style-label">
              Window style
            </div>
            <div
              className="settings-options settings-options-wide"
              role="group"
              aria-labelledby="window-style-label"
              aria-describedby="window-style-hint"
            >
              {[
                ['auto', 'Auto', 'Match your device'],
                ['macos', 'Mac', 'macOS window style'],
                ['windows', 'Win', 'Windows window style'],
                ['none', 'None', 'No window decoration'],
              ].map(([value, label, description]) => (
                <button
                  key={value}
                  type="button"
                  className={`settings-option ${windowStyle === value ? 'selected' : ''}`}
                  onClick={() => onWindowStyleChange(value)}
                  aria-pressed={windowStyle === value}
                  title={description}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p id="window-style-hint" className="settings-hint">
            Decorative title bar. Auto follows your device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
