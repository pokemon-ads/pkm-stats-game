import React, { useContext, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ClickerContext, getHelperEffectiveBase, calculateShinyCost, calculateHelperProduction } from '../context/ClickerContext';
import { getCurrentEvolution, getNextEvolution, calculateHelperCost, calculateBulkHelperCost, calculateMaxAffordable } from '../config/helpers';
import { getSkillTree, getSkill, createSkillTrees } from '../config/skill-trees';
import { SkillTree } from './SkillTree';
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
  // For small numbers (like Pikachu's base production), show decimals if needed
  if (num < 10 && num % 1 !== 0) return num.toFixed(1);
  return Math.floor(num).toLocaleString();
};

export const PokemonList: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(ClickerContext);
  const [purchaseAnimation, setPurchaseAnimation] = useState<string | null>(null);
  const [evolvingHelper, setEvolvingHelper] = useState<string | null>(null);
  const [shinyAnimation, setShinyAnimation] = useState<string | null>(null);
  const [hoveredHelper, setHoveredHelper] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number; showBelow?: boolean } | null>(null);
  const [selectedHelperForSkillTree, setSelectedHelperForSkillTree] = useState<string | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<{ [helperId: string]: number | 'max' }>({});

  const handleBuy = useCallback((helperId: string, quantity: number = 1) => {
    const helper = state.helpers.find(h => h.id === helperId);
    if (!helper) return;
    const nextEvolution = getNextEvolution(helper);
    const willEvolve = nextEvolution && helper.count + quantity >= nextEvolution.level;
    dispatch({ type: 'BUY_HELPER', payload: { helperId, quantity } });
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

  // Calculate skill effects helper (only for this specific helper)
  const calculateSkillEffectsForHelper = useCallback((helper: typeof state.helpers[0]) => {
    // #region agent log
    const calcStart = performance.now();
    // #endregion
    const allHelperIds = state.helpers.map(h => h.id);
    const skillTrees = createSkillTrees(allHelperIds);
    const skillTree = getSkillTree(helper.id, skillTrees);
    if (!skillTree) {
      return { productionBonus: 0, productionMultiplier: 1 };
    }

    let productionBonus = 0;
    let productionMultiplier = 1;

    for (const skillId of helper.unlockedSkills) {
      const skill = getSkill(skillId, skillTree);
      if (!skill) continue;

      if (skill.type === 'PRODUCTION_BONUS') {
        productionBonus += skill.value;
      } else if (skill.type === 'PRODUCTION_MULTIPLIER' || skill.type === 'SPECIAL') {
        productionMultiplier *= skill.value;
      }
    }

    // #region agent log
    const calcTime = performance.now() - calcStart;
    if (calcTime > 2) {
      fetch('http://127.0.0.1:7242/ingest/9a77cddd-fb46-4bc0-be08-45e0027b17d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PokemonList.tsx:91',message:'calculateSkillEffectsForHelper slow',data:{calcTime,helperId:helper.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    }
    // #endregion

    return { productionBonus, productionMultiplier };
  }, [state]);

  // Calculate remaining EV points for a helper
  const calculateRemainingEV = useCallback((helper: typeof state.helpers[0]) => {
    const allHelperIds = state.helpers.map(h => h.id);
    const skillTrees = createSkillTrees(allHelperIds);
    const skillTree = getSkillTree(helper.id, skillTrees);
    if (!skillTree) return helper.ev;

    // Calculate total EV spent on unlocked skills
    let evSpent = 0;
    for (const skillId of helper.unlockedSkills) {
      const skill = getSkill(skillId, skillTree);
      if (skill) {
        evSpent += skill.cost;
      }
    }

    // Remaining EV = total EV - EV spent
    return Math.max(0, helper.ev - evSpent);
  }, [state]);

  // Calculate total production from all helpers using linear formula
  const totalProduction = useMemo(() => {
    return state.helpers.reduce((sum, h) => {
      if (h.count === 0) return sum;
      const effectiveBase = getHelperEffectiveBase(h, state.upgrades);
      const shinyMultiplier = h.isShiny ? 10 : 1;
      const helperMultiplier = state.upgrades
        .filter(u => u.purchased && u.type === 'HELPER_MULTIPLIER' && u.targetId === h.id)
        .reduce((acc, u) => acc * u.value, 1);
      const skillEffects = calculateSkillEffectsForHelper(h);
      return sum + calculateHelperProduction(
        effectiveBase,
        h.count,
        helperMultiplier,
        shinyMultiplier,
        skillEffects.productionBonus,
        skillEffects.productionMultiplier
      );
    }, 0);
  }, [state.helpers, state.upgrades, calculateSkillEffectsForHelper]);


  // Find the next locked helper (the first one that is not unlocked)
  const nextLockedHelper = useMemo(() => {
    return state.helpers.find(h => !h.unlocked);
  }, [state.helpers]);

  // Filter helpers: show only unlocked ones + the next locked one
  const visibleHelpers = useMemo(() => {
    return state.helpers.filter(helper => 
      helper.unlocked || helper.id === nextLockedHelper?.id
    );
  }, [state.helpers, nextLockedHelper]);

  // #region agent log
  const renderStart = performance.now();
  let renderCount = 0;
  // #endregion

  return (
    <div className={`helpers-container`}>
      {/* Helpers list */}
      <div className="helpers-list">
        {visibleHelpers.map((helper) => {
          // #region agent log
          renderCount++;
          if (renderCount === 1) {
            fetch('http://127.0.0.1:7242/ingest/9a77cddd-fb46-4bc0-be08-45e0027b17d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PokemonList.tsx:151',message:'PokemonList render start',data:{visibleHelpersCount:visibleHelpers.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          }
          // #endregion
          // Calculate dynamic cost based on count and production
          const cost = calculateHelperCost(helper, state.energyPerSecond);
          const shinyCost = calculateShinyCost(helper);
          const effectiveBase = getHelperEffectiveBase(helper, state.upgrades);
          const shinyMultiplier = helper.isShiny ? 10 : 1;
          
          // Get helper multiplier from upgrades
          const helperMultiplier = state.upgrades
            .filter(u => u.purchased && u.type === 'HELPER_MULTIPLIER' && u.targetId === helper.id)
            .reduce((acc, u) => acc * u.value, 1);
          
          // Calculate skill effects
          const skillEffects = calculateSkillEffectsForHelper(helper);
          
          // Calculate production using linear scaling (each helper gives the same production)
          const helperTotalProduction = calculateHelperProduction(
            effectiveBase,
            helper.count,
            helperMultiplier,
            shinyMultiplier,
            skillEffects.productionBonus,
            skillEffects.productionMultiplier
          );
          
          const currentEvolution = getCurrentEvolution(helper);
          
          const isMaxLevel = helper.level >= 252;
          const quantity = buyQuantity[helper.id] || 1;
          const maxByLevel = Math.max(0, 252 - helper.level);
          const maxByEnergy = calculateMaxAffordable(helper, state.energyPerSecond, state.energy);
          const maxPurchasable = Math.min(maxByLevel, maxByEnergy);
          
          const actualQuantity = quantity === 'max' ? maxPurchasable : (typeof quantity === 'number' ? Math.min(quantity, maxByLevel) : 1);
          const bulkCost = actualQuantity > 1 ? calculateBulkHelperCost(helper, state.energyPerSecond, actualQuantity) : cost;
          const canAfford = state.energy >= bulkCost && !isMaxLevel && actualQuantity > 0;
          const canAffordShiny = state.energy >= shinyCost && helper.count > 0 && !helper.isShiny;
          const isPurchasing = purchaseAnimation === helper.id;
          const isEvolving = evolvingHelper === helper.id;
          const isShinyAnimating = shinyAnimation === helper.id;
          const isLocked = !helper.unlocked;

          return (
            <div 
              key={helper.id} 
              className={`helper-card ${isPurchasing ? 'purchasing' : ''} ${isEvolving ? 'evolving' : ''} ${helper.count > 0 ? 'owned' : ''} ${helper.isShiny ? 'shiny' : ''} ${isShinyAnimating ? 'shiny-animating' : ''} ${isLocked ? 'locked' : ''}`}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const tooltipWidth = 280; // Approximate tooltip width
                const tooltipHeight = 220; // Approximate tooltip height
                const margin = 12;
                
                // Calculate preferred position (centered above the card)
                let x = rect.left + rect.width / 2;
                let y = rect.top;
                let showBelow = false;
                
                // Check if tooltip would go off screen vertically
                if (y - tooltipHeight - margin < 0) {
                  // Show below instead of above
                  showBelow = true;
                  y = rect.bottom + margin;
                } else {
                  y = y - margin;
                }
                
                // Adjust horizontal position if tooltip would go off screen
                const halfWidth = tooltipWidth / 2;
                if (x - halfWidth < margin) {
                  x = halfWidth + margin;
                } else if (x + halfWidth > window.innerWidth - margin) {
                  x = window.innerWidth - halfWidth - margin;
                }
                
                setHoveredHelper(helper.id);
                setTooltipPosition({ x, y, showBelow });
              }}
              onMouseLeave={() => {
                setHoveredHelper(null);
                setTooltipPosition(null);
              }}
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
                      <span className="evo-text">{t('clicker.pokemonList.evolutionText')}</span>
                    </div>
                  )}
                  {isShinyAnimating && <div className="shiny-effect">✨</div>}
                </div>
                <div className="helper-count">
                  <span className="count-value">{helper.count}</span>
                  {helper.isShiny && <span className="shiny-indicator">✨</span>}
                </div>
              </div>

              {/* Info section - simplified */}
              <div className="helper-info">
                <div className="helper-name-line">
                  <span className="helper-name">{currentEvolution.name}</span>
                  {helper.isShiny && <span className="shiny-tag">✨</span>}
                </div>
                
                {/* Level display */}
                {helper.count > 0 && (
                  <div className="helper-stats-line">
                    <span className="helper-level">Lv. {helper.level}/252</span>
                  </div>
                )}
                
                {/* Simplified display - just count and total production */}
                {helper.count > 0 && (
                  <div className="helper-production-line">
                    <span className="production-total">
                      {formatNumber(helperTotalProduction)}/s
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="helper-actions">
                {isLocked ? (
                  <div className="locked-indicator">
                    <span className="lock-icon">🔒</span>
                    <span className="lock-text">{t('clicker.pokemonList.locked')}</span>
                    <div className="unlock-cost">
                      <span className="unlock-cost-label">{t('clicker.pokemonList.unlockCost')}</span>
                      <span className="unlock-cost-value">⚡{formatNumber(helper.baseCost)}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {isMaxLevel ? (
                      <div className="max-level-indicator">
                        <span className="max-level-text">{t('clicker.pokemonList.maxLevel')}</span>
                      </div>
                    ) : (
                      <>
                        <div className="buy-quantity-selector">
                          <button
                            className={`quantity-btn ${quantity === 1 ? 'active' : ''}`}
                            onClick={() => setBuyQuantity({ ...buyQuantity, [helper.id]: 1 })}
                            disabled={isMaxLevel}
                          >
                            <span className="quantity-btn-text">1</span>
                          </button>
                          <button
                            className={`quantity-btn ${quantity === 5 ? 'active' : ''}`}
                            onClick={() => setBuyQuantity({ ...buyQuantity, [helper.id]: 5 })}
                            disabled={isMaxLevel || maxByLevel < 5}
                          >
                            <span className="quantity-btn-text">5</span>
                          </button>
                          <button
                            className={`quantity-btn ${quantity === 10 ? 'active' : ''}`}
                            onClick={() => setBuyQuantity({ ...buyQuantity, [helper.id]: 10 })}
                            disabled={isMaxLevel || maxByLevel < 10}
                          >
                            <span className="quantity-btn-text">10</span>
                          </button>
                          <button
                            className={`quantity-btn ${quantity === 20 ? 'active' : ''}`}
                            onClick={() => setBuyQuantity({ ...buyQuantity, [helper.id]: 20 })}
                            disabled={isMaxLevel || maxByLevel < 20}
                          >
                            <span className="quantity-btn-text">20</span>
                          </button>
                          <button
                            className={`quantity-btn ${quantity === 'max' ? 'active' : ''}`}
                            onClick={() => setBuyQuantity({ ...buyQuantity, [helper.id]: 'max' })}
                            disabled={isMaxLevel || maxPurchasable === 0}
                            title={maxPurchasable > 0 ? `Max: ${maxPurchasable} (${t('clicker.pokemonList.maxByEnergy')})` : t('clicker.pokemonList.notEnoughEnergy')}
                          >
                            <span className="quantity-btn-text">Max{maxPurchasable > 0 && maxPurchasable < 100 ? `(${maxPurchasable})` : ''}</span>
                          </button>
                        </div>
                        <button 
                          onClick={() => handleBuy(helper.id, actualQuantity)} 
                          disabled={!canAfford || actualQuantity === 0} 
                          className={`action-btn buy-btn ${canAfford ? 'affordable' : ''}`}
                        >
                          <span className="btn-label">{t('clicker.buy')} {actualQuantity > 1 ? `×${actualQuantity}` : ''}</span>
                          <span className="btn-cost">⚡{formatNumber(bulkCost)}</span>
                        </button>
                      </>
                    )}
                    
                    {!helper.isShiny && helper.count > 0 && (
                      <button 
                        onClick={() => handleMakeShiny(helper.id)} 
                        disabled={!canAffordShiny} 
                        className={`action-btn shiny-btn ${canAffordShiny ? 'affordable' : ''}`}
                        title={t('clicker.pokemonList.makeShiny')}
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
                    
                    {helper.count > 0 && (
                      <button 
                        onClick={() => setSelectedHelperForSkillTree(helper.id)} 
                        className="action-btn skill-tree-btn"
                        title={t('clicker.pokemonList.openSkillTree')}
                      >
                        <span className="btn-label">
                          🌳 {t('clicker.pokemonList.skills')}{(() => {
                            const remainingEV = calculateRemainingEV(helper);
                            return remainingEV > 0 ? ` (${remainingEV})` : '';
                          })()}
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* #region agent log */}
      {(() => {
        const renderTime = performance.now() - renderStart;
        if (renderTime > 10) {
          fetch('http://127.0.0.1:7242/ingest/9a77cddd-fb46-4bc0-be08-45e0027b17d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PokemonList.tsx:387',message:'PokemonList render slow',data:{renderTime,visibleHelpersCount:visibleHelpers.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        }
        return null;
      })()}
      {/* #endregion */}

      {/* Skill Tree Modal */}
      {selectedHelperForSkillTree && typeof document !== 'undefined' && createPortal(
        <SkillTree
          helper={state.helpers.find(h => h.id === selectedHelperForSkillTree)!}
          onClose={() => setSelectedHelperForSkillTree(null)}
        />,
        document.body
      )}

      {/* Tooltip rendered outside the loop using Portal */}
      {hoveredHelper && tooltipPosition && typeof document !== 'undefined' && createPortal(
        (() => {
          const helper = state.helpers.find(h => h.id === hoveredHelper);
          if (!helper) return null;
          
          const effectiveBase = getHelperEffectiveBase(helper, state.upgrades);
          const shinyMultiplier = helper.isShiny ? 10 : 1;
          const helperMultiplier = state.upgrades
            .filter(u => u.purchased && u.type === 'HELPER_MULTIPLIER' && u.targetId === helper.id)
            .reduce((acc, u) => acc * u.value, 1);
          const skillEffects = calculateSkillEffectsForHelper(helper);
          const helperTotalProduction = calculateHelperProduction(
            effectiveBase,
            helper.count,
            helperMultiplier,
            shinyMultiplier,
            skillEffects.productionBonus,
            skillEffects.productionMultiplier
          );
          const currentEvolution = getCurrentEvolution(helper);
          const nextEvolution = getNextEvolution(helper);

          const showBelow = tooltipPosition.showBelow || false;
          
          return (
            <div 
              className={`helper-tooltip ${showBelow ? 'tooltip-below' : 'tooltip-above'}`}
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
              }}
              onMouseEnter={() => {
                // Keep tooltip visible when hovering over it
              }}
              onMouseLeave={() => {
                setHoveredHelper(null);
                setTooltipPosition(null);
              }}
            >
              <div className="tooltip-content">
                <div className="tooltip-header">
                  <span className="tooltip-name">{currentEvolution.name}</span>
                  {helper.isShiny && <span className="tooltip-shiny">✨ Shiny</span>}
                </div>
                
                {/* Production per helper */}
                <div className="tooltip-row">
                  <span className="tooltip-label">{t('clicker.pokemonList.productionPerHelper')}</span>
                  <span className="tooltip-value">
                    {formatNumber(helperTotalProduction / Math.max(1, helper.count))}/s
                  </span>
                </div>
                
                {/* Total production of all helpers of this type */}
                <div className="tooltip-row">
                  <span className="tooltip-label">{t('clicker.pokemonList.totalProduction')}</span>
                  <span className="tooltip-value">
                    {formatNumber(helperTotalProduction)}/s
                  </span>
                </div>
                
                {/* Percentage of total production */}
                {totalProduction > 0 && (
                  <div className="tooltip-row">
                    <span className="tooltip-label">{t('clicker.pokemonList.productionShare')}</span>
                    <span className="tooltip-value">
                      {((helperTotalProduction / totalProduction) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
                
                {/* Compact stats */}
                {helper.count > 0 && (
                  <div className="tooltip-row">
                    <span className="tooltip-label">Lv.{helper.level}/252 • EV: {helper.ev} • Compétences: {helper.unlockedSkills.length}</span>
                  </div>
                )}
                
                {/* Evolution info if applicable */}
                {nextEvolution && (
                  <div className="tooltip-row">
                    <span className="tooltip-label">{t('clicker.pokemonList.evolution')}</span>
                    <span className="tooltip-value">
                      {nextEvolution.name} ({helper.count}/{nextEvolution.level})
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })(),
        document.body
      )}
    </div>
  );
};