import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useClickerGame } from '../hooks/useClickerGame';
import { getCurrentEvolution, getNextEvolution } from '../config/helpers';
import type { PokemonHelper } from '../types/game';
import '../styles/ClickerArea.css';

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
  type: 'star' | 'sparkle' | 'energy';
}

// Default Pokemon (Pikachu) if no helpers unlocked
const DEFAULT_POKEMON_ID = 25;

// Performance limits
const MAX_FLOATING_TEXTS = 5;
const MAX_PARTICLES = 20;
const CLICK_BATCH_INTERVAL = 100;
const MIN_EFFECT_INTERVAL = 50;

// Get animated sprite URL for a Pokemon (with shiny support)
const getAnimatedSprite = (pokemonId: number, isShiny: boolean = false) => {
  const shinyPath = isShiny ? 'shiny/' : '';
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${shinyPath}${pokemonId}.gif`;
};

// Get static sprite URL as fallback (with shiny support)
const getStaticSprite = (pokemonId: number, isShiny: boolean = false) => {
  const shinyPath = isShiny ? 'shiny/' : '';
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shinyPath}${pokemonId}.png`;
};

// Get mini sprite for Pokemon selector
const getMiniSprite = (pokemonId: number, isShiny: boolean = false) => {
  // Gen 8 icons don't have shiny variants, use regular sprites for shiny
  if (isShiny) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/${pokemonId}.png`;
};

// Format large numbers with K/M/B suffixes
const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(num >= 10 ? 0 : 1);
};

// Get type color based on Pokemon
const getTypeColor = (pokemonId: number): string => {
  const typeColors: Record<number, string> = {
    25: '#F8D030', // Pikachu - Electric
    26: '#F8D030', // Raichu
    4: '#F08030', // Charmander - Fire
    5: '#F08030',
    6: '#F08030',
    7: '#6890F0', // Squirtle - Water
    8: '#6890F0',
    9: '#6890F0',
    1: '#78C850', // Bulbasaur - Grass
    2: '#78C850',
    3: '#78C850',
    52: '#A8A878', // Meowth - Normal
    53: '#A8A878',
    66: '#C03028', // Machop - Fighting
    67: '#C03028',
    68: '#C03028',
    63: '#F85888', // Abra - Psychic
    64: '#F85888',
    65: '#F85888',
    133: '#A8A878', // Eevee
    134: '#6890F0', // Vaporeon
    135: '#F8D030', // Jolteon
    136: '#F08030', // Flareon
    196: '#F85888', // Espeon
    197: '#705848', // Umbreon
    92: '#705898', // Gastly - Ghost
    93: '#705898',
    94: '#705898',
    147: '#7038F8', // Dratini - Dragon
    148: '#7038F8',
    149: '#7038F8',
    446: '#A8A878', // Munchlax
    143: '#A8A878', // Snorlax
    246: '#B8A038', // Larvitar - Rock
    247: '#B8A038',
    248: '#B8A038',
    371: '#7038F8', // Bagon - Dragon
    372: '#7038F8',
    373: '#7038F8',
    150: '#F85888', // Mewtwo
    384: '#7038F8', // Rayquaza
    483: '#B8B8D0', // Dialga - Steel
    493: '#A8A878', // Arceus
    487: '#705898', // Giratina
  };
  return typeColors[pokemonId] || '#A8A878';
};

export const ClickerArea: React.FC = () => {
  const { handleClick, state } = useClickerGame();
  
  // Get all owned helpers
  const ownedHelpers = useMemo(() => {
    return state.helpers.filter(h => h.count > 0);
  }, [state.helpers]);
  
  // Selected Pokemon index (for switching)
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPokemonSelector, setShowPokemonSelector] = useState(false);
  
  // Get currently selected helper or default to last owned
  const selectedHelper = useMemo((): PokemonHelper | null => {
    if (ownedHelpers.length === 0) return null;
    const validIndex = Math.min(selectedIndex, ownedHelpers.length - 1);
    return ownedHelpers[validIndex];
  }, [ownedHelpers, selectedIndex]);
  
  const { displayPokemonId, displayPokemonName, displayLevel, nextEvolution, typeColor } = useMemo(() => {
    if (!selectedHelper) {
      return { 
        displayPokemonId: DEFAULT_POKEMON_ID, 
        displayPokemonName: 'Pikachu',
        displayLevel: 1,
        nextEvolution: null,
        typeColor: '#F8D030'
      };
    }
    
    const evolution = getCurrentEvolution(selectedHelper);
    const next = getNextEvolution(selectedHelper);
    
    return {
      displayPokemonId: evolution.pokemonId,
      displayPokemonName: evolution.name,
      displayLevel: Math.max(1, selectedHelper.level),
      nextEvolution: next,
      typeColor: getTypeColor(evolution.pokemonId)
    };
  }, [selectedHelper]);

  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const pendingClicksRef = useRef(0);
  const lastEffectTimeRef = useRef(0);
  const batchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  const createParticles = useCallback((centerX: number, centerY: number, intensity: number = 1) => {
    const particleCount = Math.min(Math.ceil(8 * intensity), 15);
    const newParticles: Particle[] = [];
    const baseId = Date.now();
    
    const types: Array<'star' | 'sparkle' | 'energy'> = ['star', 'sparkle', 'energy'];
    const colors = [typeColor, '#ffcb05', '#ffffff', '#ff6b6b', '#4ecdc4'];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const distance = 50 + Math.random() * 80 * intensity;
      
      newParticles.push({
        id: baseId + i,
        x: centerX,
        y: centerY,
        color: colors[Math.floor(Math.random() * colors.length)],
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }
    
    setParticles(prev => {
      const combined = [...prev, ...newParticles];
      return combined.slice(-MAX_PARTICLES);
    });
    
    const particleIds = new Set(newParticles.map(p => p.id));
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !particleIds.has(p.id)));
    }, 1000);
  }, [typeColor]);

  const showVisualEffects = useCallback((clickCount: number, x: number, y: number) => {
    const now = Date.now();
    
    if (now - lastEffectTimeRef.current < MIN_EFFECT_INTERVAL) {
      return;
    }
    lastEffectTimeRef.current = now;

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      createParticles(centerX, centerY, Math.min(clickCount, 3));
    }
    
    const totalAmount = state.energyPerClick * clickCount;
    const displayText = clickCount > 1 
      ? `+${formatNumber(totalAmount)} (x${clickCount})`
      : `+${formatNumber(totalAmount)}`;
    
    const newText: FloatingTextItem = {
      id: now + Math.random(),
      x,
      y,
      text: displayText,
      amount: totalAmount
    };
    
    setFloatingTexts(prev => [...prev, newText].slice(-MAX_FLOATING_TEXTS));
    
    setIsClicking(true);
    setShowBurst(true);
    
    setTimeout(() => setIsClicking(false), 150);
    setTimeout(() => setShowBurst(false), 400);
    
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
    handleClick();
    lastClickPosRef.current = { x: e.clientX, y: e.clientY };
    pendingClicksRef.current += 1;
    
    if (!batchTimeoutRef.current) {
      batchTimeoutRef.current = setTimeout(processBatchedClicks, CLICK_BATCH_INTERVAL);
    }
  }, [handleClick, processBatchedClicks]);

  // Switch to next Pokemon
  const handleNextPokemon = useCallback(() => {
    if (ownedHelpers.length <= 1) return;
    setSelectedIndex(prev => (prev + 1) % ownedHelpers.length);
  }, [ownedHelpers.length]);

  // Switch to previous Pokemon
  const handlePrevPokemon = useCallback(() => {
    if (ownedHelpers.length <= 1) return;
    setSelectedIndex(prev => prev === 0 ? ownedHelpers.length - 1 : prev - 1);
  }, [ownedHelpers.length]);

  // Calculate HP bar percentage (based on progress to next evolution)
  const hpPercentage = useMemo(() => {
    if (!selectedHelper || !nextEvolution) return 100;
    const current = selectedHelper.count;
    const prevLevel = selectedHelper.evolutions?.find(e => e.level <= current)?.level || 0;
    const progress = ((current - prevLevel) / (nextEvolution.level - prevLevel)) * 100;
    return Math.min(100, Math.max(0, progress));
  }, [selectedHelper, nextEvolution]);

  // Get HP bar color class
  const hpBarClass = hpPercentage > 50 ? '' : hpPercentage > 20 ? 'low' : 'critical';

  return (
    <div className="battle-screen" style={{ '--type-color': typeColor } as React.CSSProperties}>
      {/* Terrain background */}
      <div className="battle-terrain">
        <div className="terrain-grass" />
        <div className="terrain-shadow" />
      </div>
      
      {/* Enemy info box (top right style) */}
      <div className="pokemon-info-box enemy-box">
        <div className="info-box-inner">
          <div className="pokemon-name-row">
            <span className="pokemon-name">
              {selectedHelper?.isShiny && <span className="shiny-star">✦</span>}
              {displayPokemonName}
            </span>
            <span className="pokemon-level">Lv.{displayLevel}</span>
          </div>
          <div className="hp-bar-container">
            <span className="hp-label">EXP</span>
            <div className="hp-bar-bg">
              <div 
                className={`hp-bar-fill ${hpBarClass}`}
                style={{ width: `${hpPercentage}%` }}
              />
            </div>
          </div>
          {nextEvolution && (
            <div className="evolution-hint">
              → {nextEvolution.name} (Lv.{nextEvolution.level})
            </div>
          )}
        </div>
        <div className="info-box-decoration" />
      </div>

      {/* Pokemon battle area */}
      <div className="pokemon-battle-area">
        {/* Energy burst effect */}
        {showBurst && <div className="battle-burst" style={{ '--burst-color': typeColor } as React.CSSProperties} />}
        
        {/* Main Pokemon button */}
        <button
          ref={buttonRef}
          onClick={handleAreaClick}
          className={`pokemon-battle-button ${isClicking ? 'attacking' : ''} ${selectedHelper?.isShiny ? 'shiny' : ''}`}
        >
          {/* Shiny sparkles */}
          {selectedHelper?.isShiny && (
            <>
              <span className="shiny-sparkle">✦</span>
              <span className="shiny-sparkle">✦</span>
              <span className="shiny-sparkle">✧</span>
              <span className="shiny-sparkle">✦</span>
            </>
          )}
          <div className="pokemon-platform">
            <div className="platform-glow" style={{ background: `radial-gradient(ellipse, ${typeColor}40 0%, transparent 60%)` }} />
          </div>
          <img
            src={getAnimatedSprite(displayPokemonId, selectedHelper?.isShiny || false)}
            alt={displayPokemonName}
            className={`battle-pokemon-sprite ${isClicking ? 'attacking' : ''} ${selectedHelper?.isShiny ? 'shiny' : ''}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = getStaticSprite(displayPokemonId, selectedHelper?.isShiny || false);
            }}
          />
        </button>
      </div>

      {/* Action menu - Floating left */}
      <div className="action-menu">
        <div className="action-button active" onClick={handleAreaClick as unknown as React.MouseEventHandler}>
          <span>ATTAQUE</span>
          <small className="action-detail">+{formatNumber(state.energyPerClick)}</small>
        </div>
        <div 
          className={`action-button ${ownedHelpers.length > 1 ? '' : 'disabled'}`}
          onClick={() => ownedHelpers.length > 1 && setShowPokemonSelector(!showPokemonSelector)}
        >
          <span>POKÉMON</span>
          <small className="action-detail">{ownedHelpers.length}/15</small>
        </div>
        <div className="action-button">
          <span>STATS</span>
          <small className="action-detail">{formatNumber(state.energyPerSecond)}/s</small>
        </div>
        <div className="action-button">
          <span>INFO</span>
          <small className="action-detail">Lv.{displayLevel}</small>
        </div>
      </div>

      {/* Player stats box - Floating right */}
      <div className="pokemon-info-box player-box">
        <div className="info-box-inner">
          <div className="pokemon-name-row">
            <span className="pokemon-name">Dresseur</span>
          </div>
          <div className="hp-bar-container">
            <span className="hp-label">EP</span>
            <div className="hp-bar-bg energy-bar">
              <div 
                className="hp-bar-fill energy-fill" 
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div className="energy-display">
            <span className="energy-current">{formatNumber(state.energy)}</span>
            <span className="energy-label">ÉNERGIE</span>
          </div>
          <div className="click-power-display">
            <span className="click-power-value">⚡{formatNumber(state.energyPerClick)}/clic</span>
          </div>
        </div>
      </div>

      {/* Pokemon Selector Overlay */}
      {showPokemonSelector && (
        <div className="pokemon-selector-overlay" onClick={() => setShowPokemonSelector(false)}>
          <div className="pokemon-selector" onClick={e => e.stopPropagation()}>
            <div className="selector-header">
              <span>Choisir un Pokémon</span>
              <button className="selector-close" onClick={() => setShowPokemonSelector(false)}>✕</button>
            </div>
            <div className="selector-grid">
              {ownedHelpers.map((helper, index) => {
                const evo = getCurrentEvolution(helper);
                return (
                  <button
                    key={helper.id}
                    className={`selector-pokemon ${index === selectedIndex ? 'selected' : ''} ${helper.isShiny ? 'shiny' : ''}`}
                    onClick={() => {
                      setSelectedIndex(index);
                      setShowPokemonSelector(false);
                    }}
                  >
                    <img 
                      src={getMiniSprite(evo.pokemonId, helper.isShiny)} 
                      alt={evo.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getStaticSprite(evo.pokemonId, helper.isShiny);
                      }}
                    />
                    <span className="selector-name">{evo.name}</span>
                    <span className="selector-level">Lv.{helper.level}</span>
                    {helper.isShiny && <span className="selector-shiny">✦</span>}
                  </button>
                );
              })}
            </div>
            <div className="selector-nav">
              <button onClick={handlePrevPokemon}>◀ Préc.</button>
              <button onClick={handleNextPokemon}>Suiv. ▶</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating texts */}
      {floatingTexts.map(item => (
        <div
          key={item.id}
          className="battle-floating-text"
          style={{
            left: item.x,
            top: item.y,
          }}
        >
          <span className="floating-damage">{item.text}</span>
        </div>
      ))}
      
      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`battle-particle particle-${particle.type}`}
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            '--tx': `${particle.tx}px`,
            '--ty': `${particle.ty}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
