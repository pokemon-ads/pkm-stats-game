import React, { useContext, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ClickerContext, getHelperEffectiveBase, calculateShinyCost } from '../context/ClickerContext';
import { getCurrentEvolution, getNextEvolution, calculateHelperCost } from '../config/helpers';
import '../styles/PokemonList.css';

const getAnimatedSprite = (pokemonId: number, isShiny: boolean = false): string => {
  if (isShiny) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/${pokemonId}.gif`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonId}.gif`;
};

const getStaticSprite = (pokemonId: number, isShiny: boolean = false): string => {
  if (isShiny) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
};

const formatNumber = (num: number): string => {
  if (num >= 1e18) return (num / 1e18).toFixed(1) + 'Qi';
  if (num >= 1e15) return (num / 1e15).toFixed(1) + 'Qa';
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.floor(num).toLocaleString();
};

export const PokemonList: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(ClickerContext);
  const [purchaseAnimation, setPurchaseAnimation] = useState<string | null>(null);
  const [evolvingHelper, setEvolvingHelper] = useState<string | null>(null);
  const [shinyAnimation, setShinyAnimation] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleBuy = useCallback((helperId: string) => {
    const helper = state.helpers.find(h => h.id === helperId);
    if (!helper) return;
    const nextEvolution = getNextEvolution(helper);
    const willEvolve = nextEvolution && helper.count + 1 >= nextEvolution.level;
    dispatch({ type: 'BUY_HELPER', payload: { helperId } });
    setPurchaseAnimation(helperId);
    if (willEvolve) {
      setEvolvingHelper(helperId);
      setTimeout(() => setEvolvingHelper(null), 1500);
    }
    setTimeout(() => setPurchaseAnimation(null), 500);
  }, [state.helpers, dispatch]);

  const handleMakeShiny = useCallback((helperId: string) => {
    dispatch({ type: 'MAKE_SHINY', payload: { helperId } });
    setShinyAnimation(helperId);
    setTimeout(() => setShinyAnimation(null), 2000);
  }, [dispatch]);

  // Memoize expensive calculations
  const totalHelpers = useMemo(() => {
    return state.helpers.reduce((sum, h) => sum + h.count, 0);
  }, [state.helpers]);

  const totalProduction = useMemo(() => {
    return state.helpers.reduce((sum, h) => {
      if (h.count === 0) return sum;
      const effectiveBase = getHelperEffectiveBase(h, state.upgrades);
      const shinyMultiplier = h.isShiny ? 10 : 1;
      return sum + effectiveBase * h.count * shinyMultiplier;
    }, 0);
  }, [state.helpers, state.upgrades]);

  const shinyCount = useMemo(() => {
    return state.helpers.filter(h => h.isShiny && h.count > 0).length;
  }, [state.helpers]);

  const unlockedCount = useMemo(() => {
    return state.helpers.filter(h => h.unlocked).length;
  }, [state.helpers]);

  // Find the next locked helper (the first one that is not unlocked)
  const nextLockedHelperId = useMemo(() => {
    const nextLockedHelper = state.helpers.find(h => !h.unlocked);
    return nextLockedHelper?.id;
  }, [state.helpers]);

  // Filter helpers: show only unlocked ones + the next locked one
  const visibleHelpers = useMemo(() => {
    return state.helpers.filter(helper => 
      helper.unlocked || helper.id === nextLockedHelperId
    );
  }, [state.helpers, nextLockedHelperId]);

  return (
    <div className={`helpers-container ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header with summary stats */}
      <div className="helpers-header">
        <div className="helpers-header-top">
          <div className="helpers-title-section">
            <div className="helpers-title-row">
              <h2 className="helpers-title">{t('clicker.helpers')}</h2>
              <button 
                className="collapse-toggle-btn"
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? 'Agrandir' : 'Réduire'}
              >
                {isCollapsed ? '▼' : '▲'}
              </button>
            </div>
            {!isCollapsed && <div className="helpers-subtitle">Pokémon Assistants</div>}
          </div>
          {!isCollapsed && (
            <div className="helpers-progress">
              <div className="progress-label">Débloqués</div>
              <div className="progress-value">
                {unlockedCount}/{state.helpers.length}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(unlockedCount / state.helpers.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="helpers-stats-grid">
            <div className="stat-card total">
              <div className="stat-card-header">
                <span className="stat-icon">👥</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-card-value">{totalHelpers}</div>
            </div>
            
            <div className="stat-card production">
              <div className="stat-card-header">
                <span className="stat-icon">⚡</span>
                <span className="stat-label">Production</span>
              </div>
              <div className="stat-card-value" title={formatNumber(totalProduction) + '/s'}>
                {formatNumber(totalProduction)}/s
              </div>
            </div>
            
            <div className="stat-card shiny">
              <div className="stat-card-header">
                <span className="stat-icon">✨</span>
                <span className="stat-label">Shiny</span>
              </div>
              <div className="stat-card-value">{shinyCount}</div>
            </div>
          </div>
        )}
      </div>

      {/* Helpers list */}
      <div className="helpers-list">
        {visibleHelpers.map((helper) => {
          // Calculate dynamic cost based on count and production
          const cost = calculateHelperCost(helper, state.energyPerSecond);
          const shinyCost = calculateShinyCost(helper);
          const effectiveBase = getHelperEffectiveBase(helper, state.upgrades);
          const shinyMultiplier = helper.isShiny ? 10 : 1;
          const helperTotalProduction = effectiveBase * helper.count * shinyMultiplier;
          const hasBaseBonus = effectiveBase > helper.baseProduction;
          const currentEvolution = getCurrentEvolution(helper);
          const nextEvolution = getNextEvolution(helper);
          const evolutionProgress = nextEvolution 
            ? Math.min(100, (helper.count / nextEvolution.level) * 100) 
            : 100;
          const hasEvolutions = helper.evolutions && helper.evolutions.length > 0;
          const isFullyEvolved = !nextEvolution && hasEvolutions;
          
          const canAfford = state.energy >= cost;
          const canAffordShiny = state.energy >= shinyCost && helper.count > 0 && !helper.isShiny;
          const isPurchasing = purchaseAnimation === helper.id;
          const isEvolving = evolvingHelper === helper.id;
          const isShinyAnimating = shinyAnimation === helper.id;
          const isLocked = !helper.unlocked;

          return (
            <div 
              key={helper.id} 
              className={`helper-card ${isPurchasing ? 'purchasing' : ''} ${isEvolving ? 'evolving' : ''} ${helper.count > 0 ? 'owned' : ''} ${helper.isShiny ? 'shiny' : ''} ${isShinyAnimating ? 'shiny-animating' : ''} ${isLocked ? 'locked' : ''}`}
            >
              {/* Pokemon sprite and count */}
              <div className="helper-visual">
                <div className={`sprite-container ${helper.isShiny ? 'shiny-glow' : ''}`}>
                  <img 
                    src={getAnimatedSprite(currentEvolution.pokemonId, helper.isShiny)} 
                    alt={currentEvolution.name} 
                    className={`helper-sprite ${isEvolving ? 'evolution-flash' : ''}`} 
                    loading="lazy"
                    onError={(e) => { 
                      (e.target as HTMLImageElement).src = getStaticSprite(currentEvolution.pokemonId, helper.isShiny); 
                    }} 
                  />
                  {isEvolving && (
                    <div className="evolution-effect">
                      <span className="evo-text">EVOLUTION!</span>
                    </div>
                  )}
                  {isShinyAnimating && <div className="shiny-effect">✨</div>}
                </div>
                <div className="helper-count">
                  <span className="count-value">{helper.count}</span>
                  {helper.isShiny && <span className="shiny-indicator">✨</span>}
                </div>
              </div>

              {/* Info section */}
              <div className="helper-info">
                <div className="helper-name-line">
                  <span className="helper-name">{currentEvolution.name}</span>
                  {helper.isShiny && <span className="shiny-tag">SHINY</span>}
                  {isFullyEvolved && <span className="max-tag">MAX</span>}
                </div>
                
                {/* Production info - compact */}
                <div className="helper-production-line">
                  <span className={`production-value ${hasBaseBonus ? 'boosted' : ''}`}>
                    {formatNumber(effectiveBase)}/s
                    {hasBaseBonus && <span className="boost-indicator">↑</span>}
                  </span>
                  {helper.count > 0 && (
                    <>
                      <span className="production-separator">→</span>
                      <span className="production-total">
                        {formatNumber(helperTotalProduction)}/s
                        {helper.isShiny && <span className="shiny-mult">×10</span>}
                      </span>
                    </>
                  )}
                </div>

                {/* Evolution progress - only if has evolutions */}
                {nextEvolution && (
                  <div className="evolution-progress">
                    <div className="evo-bar">
                      <div 
                        className="evo-fill" 
                        style={{ width: `${evolutionProgress}%` }} 
                      />
                    </div>
                    <span className="evo-label">
                      → {nextEvolution.name} ({helper.count}/{nextEvolution.level})
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="helper-actions">
                {isLocked ? (
                  <div className="locked-indicator">
                    <span className="lock-icon">🔒</span>
                    <span className="lock-text">Verrouillé</span>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => handleBuy(helper.id)} 
                      disabled={!canAfford} 
                      className={`action-btn buy-btn ${canAfford ? 'affordable' : ''}`}
                    >
                      <span className="btn-label">{t('clicker.buy')}</span>
                      <span className="btn-cost">⚡{formatNumber(cost)}</span>
                    </button>
                    
                    {!helper.isShiny && helper.count > 0 && (
                      <button 
                        onClick={() => handleMakeShiny(helper.id)} 
                        disabled={!canAffordShiny} 
                        className={`action-btn shiny-btn ${canAffordShiny ? 'affordable' : ''}`}
                        title="Make Shiny (×10 production)"
                      >
                        <span className="btn-label">✨</span>
                        <span className="btn-cost">⚡{formatNumber(shinyCost)}</span>
                      </button>
                    )}
                    
                    {helper.isShiny && (
                      <div className="shiny-active-badge">
                        ✨×10
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};