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
    }, 2000); // Reduce blur every 2 seconds

    return () => clearInterval(interval);
  }, [mode, status]);

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

      const diffConfig = DIFFICULTIES[difficulty];

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
        if (mode === 'cry') {
          // Hide image completely in Cry mode
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Optional: Draw a question mark or sound icon
          ctx.font = '48px Arial';
          ctx.fillStyle = '#ccc';
          ctx.textAlign = 'center';
          ctx.fillText('?', canvas.width / 2, canvas.height / 2);
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
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className={`quizz-canvas ${isRevealed ? 'reveal-flash' : ''}`}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};