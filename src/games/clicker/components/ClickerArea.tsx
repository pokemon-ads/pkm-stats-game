import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useClickerGame } from '../hooks/useClickerGame';
import { getCurrentEvolution } from '../config/helpers';

interface FloatingTextItem {
  id: number;
  x: number;
  y: number;
  text: string;
  amount: number;
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

// Performance limits
const MAX_FLOATING_TEXTS = 5;
const MAX_PARTICLES = 16;
const CLICK_BATCH_INTERVAL = 100; // ms - batch clicks within this window
const MIN_EFFECT_INTERVAL = 50; // ms - minimum time between visual effects

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
    const purchasedHelpers = state.helpers.filter(h => h.count > 0);
    
    if (purchasedHelpers.length === 0) {
      return { displayPokemonId: DEFAULT_POKEMON_ID, displayPokemonName: 'Pikachu' };
    }
    
    const lastHelper = purchasedHelpers[purchasedHelpers.length - 1];
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
  
  // Click batching refs
  const pendingClicksRef = useRef(0);
  const lastEffectTimeRef = useRef(0);
  const batchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickPosRef = useRef({ x: 0, y: 0 });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  const createParticles = useCallback((centerX: number, centerY: number, intensity: number = 1) => {
    const colors = ['#ffcb05', '#a855f7', '#3b4cca', '#e94560', '#4ade80'];
    const particleCount = Math.min(Math.ceil(4 * intensity), 8);
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 50 + Math.random() * 30 * intensity;
      newParticles.push({
        id: Date.now() + i + Math.random(),
        x: centerX,
        y: centerY,
        color: colors[Math.floor(Math.random() * colors.length)],
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
      });
    }
    
    setParticles(prev => {
      const combined = [...prev, ...newParticles];
      // Keep only the most recent particles
      return combined.slice(-MAX_PARTICLES);
    });
    
    // Clean up particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 600);
  }, []);

  const showVisualEffects = useCallback((clickCount: number, x: number, y: number) => {
    const now = Date.now();
    
    // Throttle visual effects
    if (now - lastEffectTimeRef.current < MIN_EFFECT_INTERVAL) {
      return;
    }
    lastEffectTimeRef.current = now;

    // Get button center for particles
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      createParticles(centerX, centerY, Math.min(clickCount, 3));
    }
    
    // Create floating text with accumulated amount
    const totalAmount = state.energyPerClick * clickCount;
    const displayText = clickCount > 1 
      ? `+${totalAmount.toFixed(totalAmount >= 10 ? 0 : 1)} (x${clickCount})`
      : `+${totalAmount.toFixed(totalAmount >= 10 ? 0 : 1)}`;
    
    const newText: FloatingTextItem = {
      id: now + Math.random(),
      x,
      y,
      text: displayText,
      amount: totalAmount
    };
    
    setFloatingTexts(prev => {
      const updated = [...prev, newText];
      // Keep only the most recent texts
      return updated.slice(-MAX_FLOATING_TEXTS);
    });
    
    // Trigger click animation
    setIsClicking(true);
    setShowBurst(true);
    
    setTimeout(() => setIsClicking(false), 150);
    setTimeout(() => setShowBurst(false), 400);
    
    // Auto-remove floating text after animation
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== newText.id));
    }, 800);
  }, [state.energyPerClick, createParticles]);

  const processBatchedClicks = useCallback(() => {
    const clickCount = pendingClicksRef.current;
    if (clickCount > 0) {
      showVisualEffects(clickCount, lastClickPosRef.current.x, lastClickPosRef.current.y);
      pendingClicksRef.current = 0;
    }
    batchTimeoutRef.current = null;
  }, [showVisualEffects]);

  const handleAreaClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Always process the game click immediately
    handleClick();
    
    // Store click position
    lastClickPosRef.current = { x: e.clientX, y: e.clientY };
    
    // Batch visual effects
    pendingClicksRef.current += 1;
    
    // If no batch timeout is pending, start one
    if (!batchTimeoutRef.current) {
      batchTimeoutRef.current = setTimeout(processBatchedClicks, CLICK_BATCH_INTERVAL);
    }
  }, [handleClick, processBatchedClicks]);

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
              (e.target as HTMLImageElement).src = getStaticSprite(displayPokemonId);
            }}
          />
        </button>
      </div>
      
      {/* Click info */}
      <div className="click-info">
        <span className="click-power">⚡ {state.energyPerClick.toFixed(1)} per click</span>
      </div>
      
      {/* Floating texts - using CSS-only animation for performance */}
      {floatingTexts.map(item => (
        <div
          key={item.id}
          className="floating-text-container"
          style={{
            position: 'fixed',
            left: item.x,
            top: item.y,
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <span className="floating-text-value">{item.text}</span>
        </div>
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
          will-change: transform, opacity;
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
        
        .floating-text-container {
          animation: floatUpFade 0.8s ease-out forwards;
          will-change: transform, opacity;
        }
        
        .floating-text-value {
          font-weight: 900;
          font-size: 1.8rem;
          color: #ffcb05;
          text-shadow: 
            0 0 10px rgba(255, 203, 5, 0.8),
            0 0 20px rgba(255, 203, 5, 0.5),
            2px 2px 0 #3b4cca,
            -1px -1px 0 #3b4cca;
          transform: translate(-50%, -50%);
          display: block;
          white-space: nowrap;
        }
        
        @keyframes floatUpFade {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.5);
          }
          20% {
            transform: translate(-50%, -70%) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -150%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};