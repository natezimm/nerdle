import React from 'react';
import './StatsModal.css';
import { getStats, formatTime } from '../utils/stats';

const StatsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const stats = getStats();
    const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Statistics</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
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
                        <span>{stats.fewestGuesses !== null ? stats.fewestGuesses : "--"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsModal;
