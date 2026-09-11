import React, { useReducer } from 'react';
import './StatsModal.css';
import { getStats, formatTime, resetStats } from '../utils/stats';
import { useModalBehavior } from '../hooks/useModalBehavior';

const StatsModal = ({ isOpen, onClose, wordLength = 5 }) => {
  const [, refresh] = useReducer((value) => value + 1, 0);
  const requestReset = (scope) => {
    const label =
      scope === 'all' ? 'all word lengths' : `${wordLength}-letter games`;
    if (!window.confirm(`Reset stats for ${label}? This cannot be undone.`))
      return;
    resetStats(scope);
    refresh();
  };
  const dialogRef = useModalBehavior({ isOpen, onClose });

  if (!isOpen) return null;

  const stats = getStats(wordLength);
  const winRate =
    stats.totalGames > 0
      ? Math.round((stats.wins / stats.totalGames) * 100)
      : 0;

  return (
    <div className="modal-overlay" role="presentation">
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="modal-header">
          <div>
            <h2 id="stats-title" aria-label="Statistics">
              Statistics
            </h2>
            <div className="stats-mode">{wordLength}-letter</div>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close statistics"
          >
            &times;
          </button>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.totalGames}</div>
            <div className="stat-label">Played</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{winRate}%</div>
            <div className="stat-label">Win %</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.longestStreak}</div>
            <div className="stat-label">Max Streak</div>
          </div>
        </div>
        <div className="stats-details">
          <div className="detail-item">
            <span>Fastest Time:</span>
            <span>{formatTime(stats.fastestSolveTime)}</span>
          </div>
          <div className="detail-item">
            <span>Fewest Guesses:</span>
            <span>
              {stats.fewestGuesses !== null ? stats.fewestGuesses : '--'}
            </span>
          </div>
        </div>
        <div className="stats-reset" role="group" aria-label="Reset statistics">
          <button
            className="settings-action"
            onClick={() => requestReset(wordLength)}
          >
            Reset {wordLength}-letter stats
          </button>
          <button
            className="stats-reset-all"
            onClick={() => requestReset('all')}
          >
            Reset all word lengths
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
