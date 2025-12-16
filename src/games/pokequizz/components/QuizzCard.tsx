import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Pokemon } from '../../../types/pokemon';
import type { GameStatus, Difficulty } from '../types/game';
import { DIFFICULTIES } from '../config/constants';
import '../styles/QuizzCard.css';

interface QuizzCardProps {
  pokemon: Pokemon | null;
  status: GameStatus;
  difficulty: Difficulty;
  isCorrect: boolean | null;
  onGuess: (guess: string) => void;
  onGiveUp: () => void;
}

export const QuizzCard: React.FC<QuizzCardProps> = ({
  pokemon,
  status,
  difficulty,
  isCorrect,
  onGuess,
  onGiveUp
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'playing') {
      setInputValue('');
      inputRef.current?.focus();
    }
  }, [status, pokemon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onGuess(inputValue.trim());
    }
  };

  const diffConfig = DIFFICULTIES[difficulty];
  const isRevealed = status === 'revealed';
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pokemon || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = pokemon.sprites.front_default;
    
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save context state
      ctx.save();

      // Handle rotation
      if (!isRevealed && diffConfig.rotate) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI); // 180 degrees
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      // Draw image
      // Center the image in the canvas
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8;
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      
      // Apply filters
      if (!isRevealed) {
        ctx.filter = `brightness(0) blur(${diffConfig.blur}px)`;
      } else {
        ctx.filter = 'none';
      }

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      // Restore context state
      ctx.restore();
    };
  }, [pokemon, isRevealed, diffConfig]);

  return (
    <div className="quizz-card">
      <h2 className="quizz-title">
        {isRevealed
          ? (isCorrect ? t('quizz.correct', 'Bravo !') : t('quizz.wrong', 'Dommage !'))
          : t('quizz.question', 'Quel est ce Pokémon ?')}
      </h2>

      <div className="quizz-image-container">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="quizz-canvas"
          onContextMenu={(e) => e.preventDefault()}
        />
        
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