import React from 'react';
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

  return (
    <div className="pokequizz-game">
      <SettingsSidebar
        settings={settings}
        onUpdateSettings={updateSettings}
        onPlayCry={playCry}
      />
      
      <main className="pokequizz-main">
        {settings.mode === 'time_attack' && gameState.timeLeft !== undefined && (
          <div className="game-timer">
            {t('quizz.timeLeft', { time: gameState.timeLeft })}
          </div>
        )}
        
        {settings.mode === 'survival' && gameState.lives !== undefined && (
          <div className="game-lives">
            {t('quizz.lives', { lives: gameState.lives })}
          </div>
        )}

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
      </main>

      <StatsSidebar stats={stats} />
    </div>
  );
};