import type { Leaderboard as LeaderboardType } from '../services/LeaderboardService';
import '../styles/Leaderboard.css';

interface LeaderboardProps {
  leaderboard: LeaderboardType | null;
  currentScore?: number;
  onClear?: () => void;
}

export const Leaderboard = ({ leaderboard, currentScore, onClear }: LeaderboardProps) => {
  if (!leaderboard || leaderboard.entries.length === 0) {
    return (
      <div className="leaderboard-container empty">
        <h3>Classement</h3>
        <p>Aucun score enregistré pour cette configuration.</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h3>Classement</h3>
      <div className="leaderboard-filter-info">
        <small>{leaderboard.filterDescription}</small>
      </div>
      
      <div className="leaderboard-list">
        <div className="leaderboard-header">
          <span>Rang</span>
          <span>Score</span>
          <span>Date</span>
        </div>
        
        {leaderboard.entries.map((entry, index) => {
          const isCurrentScore = currentScore !== undefined && entry.score === currentScore && 
            new Date(entry.date).getTime() > Date.now() - 5000; // Simple check for "just added"

          return (
            <div 
              key={`${entry.date}-${index}`} 
              className={`leaderboard-entry ${isCurrentScore ? 'highlight' : ''}`}
            >
              <span className="rank">#{index + 1}</span>
              <span className="score">{entry.score} / {entry.rounds}</span>
              <span className="date">
                {new Date(entry.date).toLocaleDateString()}
              </span>
            </div>
          );
        })}
      </div>
      
      {onClear && (
        <button onClick={onClear} className="clear-leaderboard-button">
          🗑️ Effacer le classement
        </button>
      )}
    </div>
  );
};