import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameStats } from '../types/game';
import '../styles/Sidebars.css';

interface StatsSidebarProps {
  stats: GameStats;
  isOpen?: boolean;
  onClose?: () => void;
}

export const StatsSidebar: React.FC<StatsSidebarProps> = ({ 
  stats,
  isOpen = false,
  onClose 
}) => {
  const { t } = useTranslation();

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(2) + 's';
  };

  const successRate = stats.totalCount > 0 
    ? Math.round((stats.correctCount / stats.totalCount) * 100) 
    : 0;

  // Determine HP bar color based on success rate
  const getHpBarClass = () => {
    if (successRate >= 60) return '';
    if (successRate >= 30) return 'medium';
    return 'low';
  };

  return (
    <aside className={`pokequizz-sidebar stats-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Close button for mobile */}
      {onClose && (
        <button 
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label={t('common.close', 'Fermer')}
        >
          ✕
        </button>
      )}

      <div className="sidebar-section">
        <h3 className="sidebar-title">{t('stats.title', 'Statistiques')}</h3>
        
        {/* Current Streak - Highlighted */}
        <div className="stat-row">
          <span className="stat-label">{t('stats.currentStreak', 'Série')}</span>
          <span className="stat-value highlight">
            <span className="streak-display">
              {stats.currentStreak > 0 && <span className="streak-fire">🔥</span>}
              {stats.currentStreak}
            </span>
          </span>
        </div>

        {/* Best Streak */}
        <div className="stat-row">
          <span className="stat-label">{t('stats.bestStreak', 'Record')}</span>
          <span className="stat-value">🏆 {stats.bestStreak}</span>
        </div>

        {/* Success Rate with HP Bar style */}
        <div className="stat-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-label">{t('stats.successRate', 'Précision')}</span>
            <span className="stat-value">{successRate}%</span>
          </div>
          <div className="progress-bar-container">
            <span className="progress-label">HP</span>
            <div className="progress-bar">
              <div 
                className={`progress-bar-fill ${getHpBarClass()}`}
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Last Time */}
        <div className="stat-row">
          <span className="stat-label">{t('stats.lastTime', 'Dernier')}</span>
          <span className="stat-value">⏱️ {stats.lastTime ? formatTime(stats.lastTime) : '-'}</span>
        </div>

        {/* Average Time */}
        <div className="stat-row">
          <span className="stat-label">{t('stats.averageTime', 'Moyenne')}</span>
          <span className="stat-value">📊 {formatTime(stats.averageTime)}</span>
        </div>

        {/* Total Found */}
        <div className="stat-row">
          <span className="stat-label">{t('stats.total', 'Trouvés')}</span>
          <span className="stat-value">
            ✅ {stats.correctCount} / {stats.totalCount}
          </span>
        </div>
      </div>
    </aside>
  );
};