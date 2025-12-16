import React from 'react';
import { useTranslation } from 'react-i18next';
import { GENERATIONS } from '../../../types/pokemon';
import { DIFFICULTIES } from '../config/constants';
import type { GameSettings, Difficulty } from '../types/game';
import '../styles/Sidebars.css';

interface SettingsSidebarProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onPlayCry: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ settings, onUpdateSettings, onPlayCry }) => {
  const { t } = useTranslation();
  const showCryButton = settings.difficulty === 'facile';

  return (
    <aside className="pokequizz-sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">{t('settings.title', 'Paramètres')}</h3>

        {showCryButton && (
          <div className="setting-row">
            <button
              className="play-cry-btn-sidebar"
              onClick={onPlayCry}
              title={t('quizz.playCry', 'Écouter le cri')}
              type="button"
            >
              🔊 {t('quizz.playCry', 'Écouter le cri')}
            </button>
          </div>
        )}
        
        <div className="setting-row">
          <label className="setting-label">{t('settings.generation', 'Génération')}</label>
          <select 
            className="setting-select"
            value={settings.generation}
            onChange={(e) => onUpdateSettings({ generation: Number(e.target.value) })}
          >
            <option value={0}>{t('settings.allGenerations', 'Toutes les générations')}</option>
            {Object.entries(GENERATIONS).map(([key, gen]) => (
              <option key={key} value={key}>
                {gen.name}
              </option>
            ))}
          </select>
        </div>

        <div className="setting-row">
          <label className="setting-label">{t('settings.difficulty', 'Difficulté')}</label>
          <select 
            className="setting-select"
            value={settings.difficulty}
            onChange={(e) => onUpdateSettings({ difficulty: e.target.value as Difficulty })}
          >
            {Object.entries(DIFFICULTIES).map(([key, diff]) => (
              <option key={key} value={key}>
                {diff.label}
              </option>
            ))}
          </select>
        </div>

      </div>
    </aside>
  );
};