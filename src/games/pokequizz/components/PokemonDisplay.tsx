import React, { useEffect, useRef, useState } from 'react';
import type { Pokemon } from '../../../types/pokemon';
import type { Difficulty, GameMode } from '../types/game';
import { DIFFICULTIES, MAX_BLUR, BLUR_STEPS } from '../config/constants';

interface PokemonDisplayProps {
  pokemon: Pokemon | null;
  isRevealed: boolean;
  difficulty: Difficulty;
  mode: GameMode;
  status: 'loading' | 'playing' | 'revealed';
}

export const PokemonDisplay: React.FC<PokemonDisplayProps> = ({
  pokemon,
  isRevealed,
  difficulty,
  mode,
  status
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentBlur, setCurrentBlur] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Initialize blur for Blur mode
  useEffect(() => {
    if (status === 'playing' && mode === 'blur') {
      setCurrentBlur(MAX_BLUR);
    }
  }, [status, mode]);

  // Reduce blur over time for Blur mode
  useEffect(() => {
    if (mode !== 'blur' || status !== 'playing') return;

    const interval = setInterval(() => {
      setCurrentBlur(prev => Math.max(0, prev - (MAX_BLUR / BLUR_STEPS)));
    }, 2000);

    return () => clearInterval(interval);
  }, [mode, status]);

  // Reset image loaded state when pokemon changes
  useEffect(() => {
    setIsImageLoaded(false);
  }, [pokemon]);

  useEffect(() => {
    if (!pokemon || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = pokemon.sprites.front_default;
    
    img.onload = () => {
      setIsImageLoaded(true);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save context state
      ctx.save();

      const diffConfig = DIFFICULTIES[difficulty];

      // Handle rotation
      if (!isRevealed && diffConfig.rotate) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      // Center the image in the canvas
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.85;
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      
      // Apply filters
      if (!isRevealed) {
        if (mode === 'cry') {
          // Hide image completely in Cry mode - show mystery silhouette
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw question mark
          ctx.font = 'bold 80px "Press Start 2P", cursive';
          ctx.fillStyle = '#475569';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', canvas.width / 2, canvas.height / 2);
          
          // Add sound wave effect
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 3;
          for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 60 + i * 25, -Math.PI / 4, Math.PI / 4);
            ctx.stroke();
          }
          
          ctx.restore();
          return;
        }

        const blurAmount = mode === 'blur' ? currentBlur : diffConfig.blur;
        ctx.filter = `brightness(0) blur(${blurAmount}px)`;
      } else {
        ctx.filter = 'none';
      }

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      // Restore context state
      ctx.restore();
    };
  }, [pokemon, isRevealed, difficulty, mode, currentBlur]);

  return (
    <div className="quizz-image-container">
      {/* Loading indicator */}
      {!isImageLoaded && status === 'loading' && (
        <div className="loading-pokeball">
          <div className="pokeball-spinner" />
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        className={`quizz-canvas ${isRevealed ? 'reveal-flash' : ''} ${!isImageLoaded ? 'loading' : ''}`}
        onContextMenu={(e) => e.preventDefault()}
      />
      
      {/* Battle effect overlay */}
      {isRevealed && (
        <div className="reveal-overlay" />
      )}
    </div>
  );
};