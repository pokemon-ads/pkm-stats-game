import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Pokemon } from '../../../types/pokemon';
import type { GameStatus, Difficulty, GameMode } from '../types/game';
import { isCloseMatch, normalizeText } from '../utils/textNormalization';
import { PokemonDisplay } from './PokemonDisplay';
import '../styles/QuizzCard.css';

interface QuizzCardProps {
  pokemon: Pokemon | null;
  status: GameStatus;
  difficulty: Difficulty;
  mode: GameMode;
  isCorrect: boolean | null;
  cryVolume: number;
  onGuess: (guess: string) => void;
  onGiveUp: () => void;
}

export const QuizzCard: React.FC<QuizzCardProps> = ({
  pokemon,
  status,
  difficulty,
  mode,
  isCorrect,
  cryVolume,
  onGuess,
  onGiveUp
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [closeCallMessage, setCloseCallMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'playing') {
      setInputValue('');
      setCloseCallMessage(null);
      inputRef.current?.focus();
    }
  }, [status, pokemon]);

  const playCry = () => {
    if (!pokemon || !pokemon.cries) return;
    const cryUrl = pokemon.cries.latest || pokemon.cries.legacy;
    if (cryUrl) {
      const audio = new Audio(cryUrl);
      audio.volume = cryVolume;
      audio.play().catch(e => console.error("Error playing cry:", e));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !pokemon) return;

    const guess = inputValue.trim();
    const targetName = pokemon.names?.fr || pokemon.name;
    
    // Check for exact match first (let parent handle it)
    if (normalizeText(guess) === normalizeText(targetName)) {
      setCloseCallMessage(null);
      onGuess(guess);
      return;
    }

    // Check for close match
    if (isCloseMatch(guess, targetName)) {
      setCloseCallMessage(t('quizz.closeCall'));
      // Optional: Shake animation or visual cue specifically for close call
      return;
    }

    setCloseCallMessage(null);
    onGuess(guess);
  };

  const isRevealed = status === 'revealed';

  return (
    <div className="quizz-card">
      <h2 className="quizz-title">
        {isRevealed
          ? (isCorrect ? t('quizz.correct', 'Bravo !') : t('quizz.wrong', 'Dommage !'))
          : t('quizz.question', 'Quel est ce Pokémon ?')}
      </h2>

      <div style={{ position: 'relative', width: 'fit-content' }}>
        <PokemonDisplay
          pokemon={pokemon}
          isRevealed={isRevealed}
          difficulty={difficulty}
          mode={mode}
          status={status}
        />
        {(pokemon?.cries && (pokemon.cries.latest || pokemon.cries.legacy)) && (
          <button
            className="play-cry-btn"
            onClick={playCry}
            type="button"
            aria-label={t('quizz.playCry', 'Écouter le cri')}
            title={t('quizz.playCry', 'Écouter le cri')}
          >
            🔊
          </button>
        )}
      </div>

      {isRevealed && pokemon ? (
        <div className="pokemon-name-reveal">
          {pokemon.names?.fr || pokemon.name}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="quizz-input-container">
          <input
            ref={inputRef}
            type="text"
            className={`quizz-input ${isCorrect === false ? 'wrong' : ''}`}
            placeholder={t('quizz.placeholder', 'Entrez le nom du Pokémon...')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={status !== 'playing'}
            autoFocus
          />
          
          {closeCallMessage && (
            <div className="close-call-message">
              {closeCallMessage}
            </div>
          )}

          <button
            type="button" 
            className="give-up-btn"
            onClick={onGiveUp}
            disabled={status !== 'playing'}
          >
            {t('quizz.giveUp', 'Je ne sais pas !')}
          </button>
        </form>
      )}
    </div>
  );
};