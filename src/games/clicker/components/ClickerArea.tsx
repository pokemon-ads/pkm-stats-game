import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useClickerGame } from '../hooks/useClickerGame';
import { FloatingText } from './FloatingText';
import { getCurrentEvolution } from '../config/helpers';

interface FloatingTextItem {
  id: number;
  x: number;
  y: number;
  text: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  tx: number;
  ty: number;
}

// Default Pokemon (Pikachu) if no helpers unlocked
const DEFAULT_POKEMON_ID = 25;

// Get animated sprite URL for a Pokemon
const getAnimatedSprite = (pokemonId: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonId}.gif`;

// Get static sprite URL as fallback
const getStaticSprite = (pokemonId: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

export const ClickerArea: React.FC = () => {
  const { handleClick, state } = useClickerGame();
  
  // Find the last unlocked helper with count > 0 and get its evolved form
  const { displayPokemonId, displayPokemonName } = useMemo(() => {
    // Filter helpers that have been purchased (count > 0)
    const purchasedHelpers = state.helpers.filter(h => h.count > 0);
    
    if (purchasedHelpers.length === 0) {
      return { displayPokemonId: DEFAULT_POKEMON_ID, displayPokemonName: 'Pikachu' };
    }
    
    // Get the last one in the list (most recently available in progression)
    const lastHelper = purchasedHelpers[purchasedHelpers.length - 1];
    
    // Get the current evolution state
    const evolution = getCurrentEvolution(lastHelper);
    
    return {
      displayPokemonId: evolution.pokemonId,
      displayPokemonName: evolution.name
    };
  }, [state.helpers]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const createParticles = useCallback((centerX: number, centerY: number) => {
    const colors = ['#ffcb05', '#a855f7', '#3b4cca', '#e94560', '#4ade80'];
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 60 + Math.random() * 40;
      newParticles.push({
        id: Date.now() + i,
        x: centerX,
        y: centerY,
        color: colors[Math.floor(Math.random() * colors.length)],
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // Clean up particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 600);
  }, []);

  const handleAreaClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    handleClick();
    
    // Get button center for particles
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      createParticles(centerX, centerY);
    }
    
    // Create floating text
    const newText: FloatingTextItem = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      text: `+${state.energyPerClick.toFixed(state.energyPerClick >= 10 ? 0 : 1)}`
    };
    setFloatingTexts(prev => [...prev, newText]);
    
    // Trigger click animation
    setIsClicking(true);
    setShowBurst(true);
    
    setTimeout(() => setIsClicking(false), 150);
    setTimeout(() => setShowBurst(false), 400);
  }, [handleClick, state.energyPerClick, createParticles]);

  const removeText = useCallback((id: number) => {
    setFloatingTexts(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <div className="clicker-area">
      <div className="clicker-pokemon-container">
        {/* Energy rings */}
        <div className="energy-ring" />
        
        {/* Energy burst effect on click */}
        {showBurst && <div className="energy-burst" />}
        
        {/* Main clicker button with Pokemon */}
        <button
          ref={buttonRef}
          onClick={handleAreaClick}
          className={`clicker-button ${isClicking ? 'clicking' : ''}`}
        >
          <img
            src={getAnimatedSprite(displayPokemonId)}
            alt={displayPokemonName}
            className={`clicker-pokemon-sprite ${isClicking ? 'clicking' : ''}`}
            onError={(e) => {
              // Fallback to static sprite if animated fails
              (e.target as HTMLImageElement).src = getStaticSprite(displayPokemonId);
            }}
          />
        </button>
      </div>
      
      {/* Click info */}
      <div className="click-info">
        <span className="click-power">⚡ {state.energyPerClick.toFixed(1)} per click</span>
      </div>
      
      {/* Floating texts */}
      {floatingTexts.map(item => (
        <FloatingText
          key={item.id}
          x={item.x}
          y={item.y}
          text={item.text}
          onComplete={() => removeText(item.id)}
        />
      ))}
      
      {/* Particles */}
      <div className="click-particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: particle.x,
              top: particle.y,
              backgroundColor: particle.color,
              '--tx': `${particle.tx}px`,
              '--ty': `${particle.ty}px`,
              width: '12px',
              height: '12px',
              boxShadow: `0 0 10px ${particle.color}`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      
      <style>{`
        .click-info {
          margin-top: 1.5rem;
          text-align: center;
        }
        
        .click-power {
          font-size: 1rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          background: rgba(0, 0, 0, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 20px;
        }
        
        .particle {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          animation: particleFly 0.6s ease-out forwards;
          z-index: 100;
        }
        
        @keyframes particleFly {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};