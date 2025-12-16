import React from 'react';
import { usePokeQuizz } from '../hooks/usePokeQuizz';
import { SettingsSidebar } from './SettingsSidebar';
import { StatsSidebar } from './StatsSidebar';
import { QuizzCard } from './QuizzCard';
import '../styles/PokeQuizzGame.css';

export const PokeQuizzGame: React.FC = () => {
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
        <QuizzCard
          pokemon={gameState.currentPokemon}
          status={gameState.status}
          difficulty={settings.difficulty}
          isCorrect={gameState.isCorrect}
          onGuess={handleGuess}
          onGiveUp={handleGiveUp}
        />
      </main>

      <StatsSidebar stats={stats} />
    </div>
  );
};