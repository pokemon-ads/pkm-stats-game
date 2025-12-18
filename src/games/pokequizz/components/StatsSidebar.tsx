import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GameStats } from '../types/game';
import '../styles/Sidebars.css';

interface StatsSidebarProps {
  stats: GameStats;
}

export const StatsSidebar: React.FC<StatsSidebarProps> = ({ stats }) => {
  const { t } = useTranslation();

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(2) + 's';
  };

  const successRate = stats.totalCount > 0 
    ? Math.round((stats.correctCount / stats.totalCount) * 100) 
    : 0;

  return (
    <aside className="pokequizz-sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">{t('stats.title', 'Statistiques')}</h3>
        
        <div className="stat-row">
          <span className="stat-label">{t('stats.currentStreak', 'Série actuelle')}</span>
          <span className="stat-value highlight">{stats.currentStreak}</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">{t('stats.bestStreak', 'Meilleure série')}</span>
          <span className="stat-value">{stats.bestStreak}</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">{t('stats.successRate', 'Précision')}</span>
          <span className="stat-value">{successRate}%</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">{t('stats.lastTime', 'Dernier temps')}</span>
          <span className="stat-value">{stats.lastTime ? formatTime(stats.lastTime) : '-'}</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">{t('stats.averageTime', 'Temps moyen')}</span>
          <span className="stat-value">{formatTime(stats.averageTime)}</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">{t('stats.total', 'Total trouvé')}</span>
          <span className="stat-value">{stats.correctCount} / {stats.totalCount}</span>
        </div>
      </div>
    </aside>
  );
};