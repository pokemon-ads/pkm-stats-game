import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePokeQuizz } from '../hooks/usePokeQuizz';
import { SettingsSidebar } from './SettingsSidebar';
import { StatsSidebar } from './StatsSidebar';
import { QuizzCard } from './QuizzCard';
import '../styles/PokeQuizzGame.css';

export const PokeQuizzGame: React.FC = () => {
  const { t } = useTranslation();
  const {
    gameState,
    settings,
    stats,
    handleGuess,
    handleGiveUp,
    updateSettings,
    playCry
  } = usePokeQuizz();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
    if (statsOpen) setStatsOpen(false);
  };

  const toggleStats = () => {
    setStatsOpen(!statsOpen);
    if (settingsOpen) setSettingsOpen(false);
  };

  const closeOverlay = () => {
    setSettingsOpen(false);
    setStatsOpen(false);
  };

  return (
    <div className="pokequizz-game">
      {/* Decorative Pokeballs */}
      <div className="pokeball-decoration top-left" />
      <div className="pokeball-decoration top-right" />
      <div className="pokeball-decoration bottom-left" />
      <div className="pokeball-decoration bottom-right" />

      {/* Mobile overlay */}
      <div 
        className={`sidebar-overlay ${settingsOpen || statsOpen ? 'active' : ''}`}
        onClick={closeOverlay}
      />

      {/* Mobile toggle buttons */}
      <button 
        className="sidebar-toggle settings"
        onClick={toggleSettings}
        aria-label={t('settings.title', 'Paramètres')}
      >
        ⚙️
      </button>
      <button 
        className="sidebar-toggle stats"
        onClick={toggleStats}
        aria-label={t('stats.title', 'Statistiques')}
      >
        📊
      </button>

      {/* Main 3-column layout */}
      <div className="pokequizz-layout">
        {/* Left Sidebar - Settings */}
        <SettingsSidebar
          settings={settings}
          onUpdateSettings={updateSettings}
          onPlayCry={playCry}
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />

        {/* Center - Battle Arena */}
        <div className="pokequizz-battle-arena">
          {/* Top HUD - Timer/Lives */}
          <div className="pokequizz-top-hud">
            {settings.mode === 'time_attack' && gameState.timeLeft !== undefined && (
              <div className="hud-info-box">
                <span className="hud-icon">⏱️</span>
                <span className="hud-value">{gameState.timeLeft}s</span>
              </div>
            )}
            
            {settings.mode === 'survival' && gameState.lives !== undefined && (
              <div className="hud-info-box">
                <span className="hud-icon">❤️</span>
                <span className="hud-value">
                  {'❤️'.repeat(gameState.lives)}{'🖤'.repeat(Math.max(0, 3 - gameState.lives))}
                </span>
              </div>
            )}

            {/* Always show streak */}
            <div className="hud-info-box">
              <span className="hud-icon">🔥</span>
              <span className="hud-value">{stats.currentStreak}</span>
            </div>
          </div>

          {/* Battle Stage */}
          <div className="pokequizz-battle-stage">
            <div className="battle-platform" />
            <QuizzCard
              pokemon={gameState.currentPokemon}
              status={gameState.status}
              difficulty={settings.difficulty}
              mode={settings.mode}
              isCorrect={gameState.isCorrect}
              cryVolume={settings.cryVolume}
              onGuess={handleGuess}
              onGiveUp={handleGiveUp}
            />
          </div>
        </div>

        {/* Right Sidebar - Stats */}
        <StatsSidebar 
          stats={stats} 
          isOpen={statsOpen}
          onClose={() => setStatsOpen(false)}
        />
      </div>
    </div>
  );
};