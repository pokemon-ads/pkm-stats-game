import React from 'react';
import { useTranslation } from 'react-i18next';
import { GENERATIONS } from '../../../types/pokemon';
import { DIFFICULTIES, GAME_MODES } from '../config/constants';
import type { GameSettings, Difficulty, GameMode } from '../types/game';
import '../styles/Sidebars.css';

interface SettingsSidebarProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onPlayCry: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ 
  settings, 
  onUpdateSettings, 
  onPlayCry,
  isOpen = false,
  onClose 
}) => {
  const { t } = useTranslation();
  const showCryButton = settings.difficulty === 'facile';

  return (
    <aside className={`pokequizz-sidebar settings-sidebar ${isOpen ? 'open' : ''}`}>
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
        <h3 className="sidebar-title">{t('settings.title', 'Paramètres')}</h3>

        {/* Game Mode Selection */}
        <div className="setting-row">
          <label className="setting-label">{t('settings.mode', 'Mode de jeu')}</label>
          <select
            className="setting-select"
            value={settings.mode}
            onChange={(e) => onUpdateSettings({ mode: e.target.value as GameMode })}
          >
            {Object.entries(GAME_MODES).map(([key, mode]) => (
              <option key={key} value={key}>
                {t(`settings.gameModes.${key}`, mode.label)}
              </option>
            ))}
          </select>
          <div className="setting-description">
            {t(`settings.gameModeDescriptions.${settings.mode}`, GAME_MODES[settings.mode].description)}
          </div>
        </div>

        {/* Generation Selection */}
        <div className="setting-row">
          <label className="setting-label">{t('settings.generation', 'Génération')}</label>
          <select
            className="setting-select"
            value={settings.generation}
            onChange={(e) => onUpdateSettings({ generation: Number(e.target.value) })}
          >
            <option value={0}>{t('settings.allGenerations', 'Toutes')}</option>
            {Object.entries(GENERATIONS).map(([key, gen]) => (
              <option key={key} value={key}>
                Gen {key} - {gen.name}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Selection */}
        <div className="setting-row">
          <label className="setting-label">{t('settings.difficulty', 'Difficulté')}</label>
          <select
            className="setting-select"
            value={settings.difficulty}
            onChange={(e) => onUpdateSettings({ difficulty: e.target.value as Difficulty })}
          >
            {Object.entries(DIFFICULTIES).map(([key, diff]) => (
              <option key={key} value={key}>
                {t(`settings.difficulties.${key}`, diff.label)}
              </option>
            ))}
          </select>
        </div>

        {/* Volume Control */}
        <div className="setting-row">
          <label className="setting-label">
            {t('settings.cryVolume', 'Volume')} - {Math.round(settings.cryVolume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.cryVolume}
            onChange={(e) => onUpdateSettings({ cryVolume: parseFloat(e.target.value) })}
            className="volume-slider"
            title={t('settings.cryVolume', 'Volume du cri')}
          />
        </div>

        {/* Play Cry Button (only in easy mode) */}
        {showCryButton && (
          <div className="setting-row">
            <button
              className="play-cry-btn-sidebar"
              onClick={onPlayCry}
              title={t('quizz.playCry', 'Écouter le cri')}
              type="button"
            >
              <span style={{ position: 'relative', zIndex: 2 }}>
                🔊 {t('quizz.playCry', 'Écouter')}
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};