import React, { useContext, useState, useMemo, useCallback, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ClickerContext, getHelperEffectiveBase, calculateShinyCost, calculateHelperProduction } from '../context/ClickerContext';
import { getCurrentEvolution, getNextEvolution, calculateHelperCost, calculateBulkHelperCost, calculateMaxAffordable } from '../config/helpers';
import { getSkillTree, getSkill, createSkillTrees } from '../config/skill-trees';
import { SkillTree } from './SkillTree';
import { formatNumberCompact as formatNumber } from '../utils/formatNumber';
import type { PokemonHelper } from '../types/game';
import '../styles/PokemonList.css';

// Cache for skill trees to avoid recreating on every render
let cachedSkillTrees: ReturnType<typeof createSkillTrees> | null = null;
let cachedHelperIdsForSkills: string[] = [];

const getCachedSkillTreesForList = (helperIds: string[]) => {
  const idsMatch = cachedHelperIdsForSkills.length === helperIds.length &&
    cachedHelperIdsForSkills.every((id, i) => id === helperIds[i]);
  
  if (!cachedSkillTrees || !idsMatch) {
    cachedHelperIdsForSkills = helperIds;
    cachedSkillTrees = createSkillTrees(helperIds);
  }
  return cachedSkillTrees;
};

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

interface TooltipPosition {
  top: number;
  left: number;
}

export const PokemonList: React.FC = () => {
  useTranslation();
  const { state, dispatch } = useContext(ClickerContext);
  const [selectedHelper, setSelectedHelper] = useState<string | null>(null);
  const [purchaseAnimation, setPurchaseAnimation] = useState<string | null>(null);
  const [evolvingHelper, setEvolvingHelper] = useState<string | null>(null);
  const [selectedHelperForSkillTree, setSelectedHelperForSkillTree] = useState<string | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number | 'max'>(1);
  const [hoveredHelper, setHoveredHelper] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const slotRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

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
  }, [dispatch]);

  // Memoize helper IDs to avoid recreating skill trees
  const helperIds = useMemo(() => state.helpers.map(h => h.id), [state.helpers]);
  
  const calculateSkillEffectsForHelper = useCallback((helper: PokemonHelper) => {
    const skillTrees = getCachedSkillTreesForList(helperIds);
    const skillTree = getSkillTree(helper.id, skillTrees);
    if (!skillTree) return { productionBonus: 0, productionMultiplier: 1 };

    let productionBonus = 0;
    let productionMultiplier = 1;

    for (const skillId of helper.unlockedSkills) {
      const skill = getSkill(skillId, skillTree);
      if (!skill) continue;
      if (skill.type === 'PRODUCTION_BONUS') productionBonus += skill.value;
      else if (skill.type === 'PRODUCTION_MULTIPLIER' || skill.type === 'SPECIAL') productionMultiplier *= skill.value;
    }
    return { productionBonus, productionMultiplier };
  }, [helperIds]);

  const calculateRemainingEV = useCallback((helper: PokemonHelper) => {
    const skillTrees = getCachedSkillTreesForList(helperIds);
    const skillTree = getSkillTree(helper.id, skillTrees);
    if (!skillTree) return helper.ev;

    let evSpent = 0;
    for (const skillId of helper.unlockedSkills) {
      const skill = getSkill(skillId, skillTree);
      if (skill) evSpent += skill.cost;
    }
    return Math.max(0, helper.ev - evSpent);
  }, [helperIds]);

  // Memoize purchased upgrades to avoid filtering on every call
  const purchasedUpgrades = useMemo(() => state.upgrades.filter(u => u.purchased), [state.upgrades]);
  
  // Calculate production for a helper
  const getHelperProduction = useCallback((helper: PokemonHelper) => {
    const effectiveBase = getHelperEffectiveBase(helper, purchasedUpgrades);
    const shinyMultiplier = helper.isShiny ? 10 : 1;
    const helperMultiplier = purchasedUpgrades
      .filter(u => u.type === 'HELPER_MULTIPLIER' && u.targetId === helper.id)
      .reduce((acc, u) => acc * u.value, 1);
    const skillEffects = calculateSkillEffectsForHelper(helper);
    return calculateHelperProduction(effectiveBase, helper.count, helperMultiplier, shinyMultiplier, skillEffects.productionBonus, skillEffects.productionMultiplier);
  }, [purchasedUpgrades, calculateSkillEffectsForHelper]);

  // Stats for header
  const totalOwned = useMemo(() => state.helpers.filter(h => h.count > 0).length, [state.helpers]);
  const totalShiny = useMemo(() => state.helpers.filter(h => h.isShiny).length, [state.helpers]);
  const nextLockedHelper = useMemo(() => state.helpers.find(h => !h.unlocked), [state.helpers]);

  const visibleHelpers = useMemo(() => {
    return state.helpers.filter(helper => helper.unlocked || helper.id === nextLockedHelper?.id);
  }, [state.helpers, nextLockedHelper]);

  // Handle mouse enter on slot
  const handleSlotMouseEnter = useCallback((helperId: string) => {
    const helper = state.helpers.find(h => h.id === helperId);
    if (!helper || !helper.unlocked) return;
    
    const slotElement = slotRefs.current[helperId];
    if (slotElement) {
      const rect = slotElement.getBoundingClientRect();
      // Position tooltip to the left of the slot
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.left - 10
      });
    }
    setHoveredHelper(helperId);
  }, [state.helpers]);

  const handleSlotMouseLeave = useCallback(() => {
    setHoveredHelper(null);
    setTooltipPosition(null);
  }, []);

  // Calculate tooltip data for hovered helper
  const hoveredHelperData = useMemo(() => {
    if (!hoveredHelper) return null;
    const helper = state.helpers.find(h => h.id === hoveredHelper);
    if (!helper || !helper.unlocked) return null;

    const production = getHelperProduction(helper);
    const totalProduction = state.energyPerSecond;
    const percentage = totalProduction > 0 ? (production / totalProduction) * 100 : 0;
    const perUnit = helper.count > 0 ? production / helper.count : 0;
    const currentEvolution = getCurrentEvolution(helper);
    const nextEvolution = getNextEvolution(helper);

    return {
      helper,
      production,
      percentage,
      perUnit,
      currentEvolution,
      nextEvolution
    };
  }, [hoveredHelper, state.helpers, state.energyPerSecond, getHelperProduction]);

  // Selected helper data - optimized to reduce recalculations
  const selectedHelperData = useMemo(() => {
    if (!selectedHelper) return null;
    const helper = state.helpers.find(h => h.id === selectedHelper);
    if (!helper) return null;

    const effectiveBase = getHelperEffectiveBase(helper, purchasedUpgrades);
    const shinyMultiplier = helper.isShiny ? 10 : 1;
    const helperMultiplier = purchasedUpgrades
      .filter(u => u.type === 'HELPER_MULTIPLIER' && u.targetId === helper.id)
      .reduce((acc, u) => acc * u.value, 1);
    const skillEffects = calculateSkillEffectsForHelper(helper);
    const production = calculateHelperProduction(effectiveBase, helper.count, helperMultiplier, shinyMultiplier, skillEffects.productionBonus, skillEffects.productionMultiplier);
    const perUnit = helper.count > 0 ? production / helper.count : effectiveBase;
    const currentEvolution = getCurrentEvolution(helper);
    const nextEvolution = getNextEvolution(helper);
    const isMaxLevel = helper.level >= 252;
    const evoProgress = nextEvolution ? ((helper.count / nextEvolution.level) * 100) : 100;
    const remainingEV = calculateRemainingEV(helper);
    const cost = calculateHelperCost(helper, state.energyPerSecond);
    const shinyCost = calculateShinyCost(helper);
    const maxByLevel = Math.max(0, 252 - helper.level);
    const maxByEnergy = calculateMaxAffordable(helper, state.energyPerSecond, state.energy);
    const maxPurchasable = Math.min(maxByLevel, maxByEnergy);
    const actualQuantity = buyQuantity === 'max' ? maxPurchasable : Math.min(buyQuantity as number, maxByLevel);
    const bulkCost = actualQuantity > 1 ? calculateBulkHelperCost(helper, state.energyPerSecond, actualQuantity) : cost;
    const canAfford = state.energy >= bulkCost && !isMaxLevel && actualQuantity > 0;
    const canAffordShiny = state.energy >= shinyCost && helper.count > 0 && !helper.isShiny;
    const percentage = state.energyPerSecond > 0 ? (production / state.energyPerSecond) * 100 : 0;

    return {
      helper, production, perUnit, currentEvolution, nextEvolution,
      isMaxLevel, evoProgress, remainingEV, cost, shinyCost,
      actualQuantity, bulkCost, canAfford, canAffordShiny, maxByLevel, percentage
    };
  }, [selectedHelper, state, calculateSkillEffectsForHelper, calculateRemainingEV, buyQuantity]);

  // Auto-select first unlocked helper
  React.useEffect(() => {
    if (!selectedHelper && visibleHelpers.length > 0) {
      const firstUnlocked = visibleHelpers.find(h => h.unlocked);
      if (firstUnlocked) setSelectedHelper(firstUnlocked.id);
    }
  }, [selectedHelper, visibleHelpers]);

  return (
    <div className="pkm-list-container">
      {/* Header */}
      <div className="pkm-list-header">
        <div className="pkm-list-title">
          <span className="pkm-list-icon">◈</span>
          <span>POKÉDEX</span>
        </div>
        <div className="pkm-list-stats">
          <span className="pkm-stat-badge">
            <span className="pkm-stat-icon">●</span>
            {totalOwned}/{state.helpers.length}
          </span>
          <span className="pkm-stat-badge shiny">
            <span className="pkm-stat-icon">✦</span>
            {totalShiny}
          </span>
          <span className="pkm-stat-badge energy">
            <span className="pkm-stat-icon">⚡</span>
            {formatNumber(state.energyPerSecond)}/s
          </span>
        </div>
      </div>

      {/* Pokemon List */}
      <div className="pkm-list-scroll">
        {visibleHelpers.map((helper) => {
          const currentEvolution = getCurrentEvolution(helper);
          const isLocked = !helper.unlocked;
          const isSelected = selectedHelper === helper.id;
          const isPurchasing = purchaseAnimation === helper.id;
          const isEvolving = evolvingHelper === helper.id;

          return (
            <button
              key={helper.id}
              ref={(el) => { slotRefs.current[helper.id] = el; }}
              className={`pkm-slot ${helper.isShiny ? 'shiny' : ''} ${isLocked ? 'locked' : ''} ${isSelected ? 'selected' : ''} ${isPurchasing ? 'purchasing' : ''} ${isEvolving ? 'evolving' : ''} ${helper.count > 0 ? 'owned' : 'not-owned'}`}
              onClick={() => !isLocked && setSelectedHelper(helper.id)}
              onMouseEnter={() => handleSlotMouseEnter(helper.id)}
              onMouseLeave={handleSlotMouseLeave}
              disabled={isLocked}
            >
              <div className="pkm-slot-sprite">
                {isLocked ? (
                  <span className="pkm-slot-locked">?</span>
                ) : (
                  <img
                    src={getAnimatedSprite(currentEvolution.pokemonId, helper.isShiny)}
                    alt={currentEvolution.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = getStaticSprite(currentEvolution.pokemonId, helper.isShiny); }}
                  />
                )}
              </div>
              <div className="pkm-slot-info">
                <span className="pkm-slot-name">
                  {isLocked ? '???' : currentEvolution.name}
                  {helper.isShiny && <span className="pkm-shiny-star">✦</span>}
                </span>
              </div>
              {!isLocked && (
                <span className="pkm-slot-count">×{helper.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tooltip Portal - Rendered outside the container */}
      {hoveredHelper && hoveredHelperData && tooltipPosition && typeof document !== 'undefined' && createPortal(
        <div 
          className="pkm-tooltip-portal"
          style={{
            position: 'fixed',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: 'translate(-100%, -50%)',
            zIndex: 9999,
          }}
        >
          <div className="pkm-tooltip">
            <div className="pkm-tooltip-header">
              <span className="pkm-tooltip-name">{hoveredHelperData.currentEvolution.name}</span>
              <span className="pkm-tooltip-level">Lv.{hoveredHelperData.helper.level}</span>
            </div>
            <div className="pkm-tooltip-stats">
              <div className="pkm-tooltip-row">
                <span className="pkm-tooltip-label">Production</span>
                <span className="pkm-tooltip-value">{formatNumber(hoveredHelperData.production)}/s</span>
              </div>
              <div className="pkm-tooltip-row highlight">
                <span className="pkm-tooltip-label">% Total</span>
                <span className="pkm-tooltip-value percent">{hoveredHelperData.percentage.toFixed(1)}%</span>
              </div>
              <div className="pkm-tooltip-row">
                <span className="pkm-tooltip-label">Par unité</span>
                <span className="pkm-tooltip-value">{formatNumber(hoveredHelperData.perUnit)}/s</span>
              </div>
              {hoveredHelperData.nextEvolution && (
                <div className="pkm-tooltip-row evo">
                  <span className="pkm-tooltip-label">→ {hoveredHelperData.nextEvolution.name}</span>
                  <span className="pkm-tooltip-value">{hoveredHelperData.helper.count}/{hoveredHelperData.nextEvolution.level}</span>
                </div>
              )}
            </div>
            <div className="pkm-tooltip-bar">
              <div className="pkm-tooltip-bar-fill" style={{ width: `${Math.min(100, hoveredHelperData.percentage)}%` }} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Detail Panel (appears at bottom when selected) */}
      {selectedHelperData && (
        <div className="pkm-detail-panel">
          <div className="pkm-detail-top">
            <div className={`pkm-detail-sprite ${selectedHelperData.helper.isShiny ? 'shiny' : ''}`}>
              <img
                src={getAnimatedSprite(selectedHelperData.currentEvolution.pokemonId, selectedHelperData.helper.isShiny)}
                alt={selectedHelperData.currentEvolution.name}
                onError={(e) => { (e.target as HTMLImageElement).src = getStaticSprite(selectedHelperData.currentEvolution.pokemonId, selectedHelperData.helper.isShiny); }}
              />
            </div>
            <div className="pkm-detail-info">
              <div className="pkm-detail-name">
                {selectedHelperData.currentEvolution.name}
                {selectedHelperData.helper.isShiny && <span className="pkm-shiny-star">✦</span>}
              </div>
              <div className="pkm-detail-badges">
                <span className="pkm-badge level">Lv.{selectedHelperData.helper.level}</span>
                {selectedHelperData.isMaxLevel && <span className="pkm-badge max">MAX</span>}
                {selectedHelperData.remainingEV > 0 && (
                  <span className="pkm-badge ev">EV:{selectedHelperData.remainingEV}</span>
                )}
              </div>
            </div>
            <div className="pkm-detail-prod">
              <span className="pkm-prod-value">{formatNumber(selectedHelperData.production)}</span>
              <span className="pkm-prod-percent">{selectedHelperData.percentage.toFixed(1)}%</span>
            </div>
          </div>

          {/* Evolution Progress */}
          {selectedHelperData.nextEvolution && (
            <div className="pkm-evo-bar">
              <div className="pkm-evo-fill" style={{ width: `${Math.min(100, selectedHelperData.evoProgress)}%` }} />
              <span className="pkm-evo-text">
                → {selectedHelperData.nextEvolution.name} ({selectedHelperData.helper.count}/{selectedHelperData.nextEvolution.level})
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pkm-detail-actions">
            {!selectedHelperData.isMaxLevel && (
              <>
                <div className="pkm-qty-row">
                  {[1, 10, 'max'].map((qty) => (
                    <button
                      key={qty}
                      className={`pkm-qty-btn ${buyQuantity === qty ? 'active' : ''}`}
                      onClick={() => setBuyQuantity(qty as number | 'max')}
                      disabled={qty !== 'max' && selectedHelperData.maxByLevel < (qty as number)}
                    >
                      {qty === 'max' ? 'MAX' : `×${qty}`}
                    </button>
                  ))}
                </div>
                <button
                  className="pkm-action-btn buy"
                  onClick={() => handleBuy(selectedHelperData.helper.id, selectedHelperData.actualQuantity)}
                  disabled={!selectedHelperData.canAfford}
                >
                  <span>CAPTURE</span>
                  <span className="pkm-btn-cost">⚡{formatNumber(selectedHelperData.bulkCost)}</span>
                </button>
              </>
            )}

            <div className="pkm-action-row">
              {!selectedHelperData.helper.isShiny && selectedHelperData.helper.count > 0 && (
                <button
                  className="pkm-action-btn shiny"
                  onClick={() => handleMakeShiny(selectedHelperData.helper.id)}
                  disabled={!selectedHelperData.canAffordShiny}
                >
                  <span>✦ SHINY</span>
                </button>
              )}
              
              {selectedHelperData.helper.count > 0 && (
                <button
                  className="pkm-action-btn skill"
                  onClick={() => setSelectedHelperForSkillTree(selectedHelperData.helper.id)}
                >
                  <span>◉ SKILLS</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Skill Tree Modal */}
      {selectedHelperForSkillTree && typeof document !== 'undefined' && createPortal(
        <SkillTree
          helper={state.helpers.find(h => h.id === selectedHelperForSkillTree)!}
          onClose={() => setSelectedHelperForSkillTree(null)}
        />,
        document.body
      )}
    </div>
  );
};
