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
  const { t, i18n } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [closeCallMessage, setCloseCallMessage] = useState<string | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'playing') {
      setInputValue('');
      setCloseCallMessage(null);
      setShowSparkles(false);
      inputRef.current?.focus();
    }
  }, [status, pokemon]);

  useEffect(() => {
    if (isCorrect === true) {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1000);
    }
  }, [isCorrect]);

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
      return;
    }

    setCloseCallMessage(null);
    onGuess(guess);
  };

  const isRevealed = status === 'revealed';

  // Get title based on state
  const getTitle = () => {
    if (isRevealed) {
      return isCorrect 
        ? t('quizz.correct', 'Bravo !') 
        : t('quizz.wrong', 'Dommage !');
    }
    return t('quizz.question', 'Quel est ce Pokémon ?');
  };

  const getTitleClass = () => {
    if (!isRevealed) return '';
    return isCorrect ? 'correct' : 'wrong';
  };

  return (
    <div className="quizz-card">
      {/* Sparkle effects for correct answers */}
      {showSparkles && (
        <div className="sparkle-container">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="sparkle"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Pokemon Info Box - like enemy Pokemon display */}
      <div className="pokemon-info-box">
        <h2 className={`quizz-title ${getTitleClass()}`}>
          {getTitle()}
        </h2>
        {status === 'playing' && (
          <div className="progress-bar-container">
            <span className="progress-label">???</span>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pokemon Display Area */}
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
          />
        )}
      </div>

      {/* Answer Section */}
      {isRevealed && pokemon ? (
        <div className={`pokemon-name-reveal ${isCorrect ? 'victory-animation' : 'defeat-animation'}`}>
          {i18n.language === 'fr' ? (pokemon.names?.fr || pokemon.name) : (pokemon.names?.en || pokemon.name)}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="quizz-input-container">
          <input
            ref={inputRef}
            type="text"
            className={`quizz-input ${isCorrect === false ? 'wrong' : ''}`}
            placeholder={t('quizz.placeholder', 'Nom du Pokémon...')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={status !== 'playing'}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
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
            {t('quizz.giveUp', 'Passer')}
          </button>
        </form>
      )}
    </div>
  );
};