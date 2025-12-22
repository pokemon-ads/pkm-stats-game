import React, { createContext, useReducer } from 'react';
import type { ReactNode, Dispatch } from 'react';
import type { GameState, ClickerAction, Upgrade, PokemonHelper, ActiveBoost } from '../types/game';
import { INITIAL_HELPERS, calculateHelperCost } from '../config/helpers';
import { INITIAL_UPGRADES } from '../config/upgrades';
import { AVAILABLE_BOOSTS, calculateBoostCost } from '../config/boosts';

const initialState: GameState = {
  energy: 0,
  totalEnergy: 0,
  clickCount: 0,
  energyPerClick: 1,
  energyPerSecond: 0,
  lastSaveTime: Date.now(),
  helpers: INITIAL_HELPERS,
  upgrades: INITIAL_UPGRADES,
  activeBoosts: [],
  boostCooldowns: [],
};

// Get active click multiplier from boosts
const getClickMultiplier = (activeBoosts: ActiveBoost[]): number => {
  const clickBoost = activeBoosts.find(b => b.type === 'CLICK_MULTIPLIER');
  return clickBoost ? clickBoost.value : 1;
};

// Calculate click power with new balanced system
// Base click = 1, then add all CLICK_BONUS values
// Optimized: filter purchased upgrades first
const calculateEnergyPerClick = (upgrades: Upgrade[], activeBoosts: ActiveBoost[] = []) => {
  let baseClick = 1;
  let clickBonus = 0;
  
  // Only iterate through purchased upgrades
  for (const u of upgrades) {
    if (u.purchased) {
      if (u.type === 'CLICK_BONUS') {
        clickBonus += u.value;
      } else if (u.type === 'CLICK_MULTIPLIER') {
        // Legacy support - still multiply if old type exists
        baseClick *= u.value;
      }
    }
  }
  
  const baseValue = baseClick + clickBonus;
  const boostMultiplier = getClickMultiplier(activeBoosts);
  
  return baseValue * boostMultiplier;
};

// Calculate helper's effective base production (original + upgrades)
// Optimized: filter purchased upgrades first
const getHelperEffectiveBase = (helper: PokemonHelper, upgrades: Upgrade[]): number => {
  let effectiveBase = helper.baseProduction;
  
  // Only iterate through purchased upgrades
  for (const u of upgrades) {
    if (u.purchased && u.type === 'HELPER_BASE' && u.targetId === helper.id) {
      effectiveBase += u.value;
    }
  }
  
  return effectiveBase;
};

// Calculate shiny cost for a helper
// Cost = baseCost * 50 * (1.3 ^ count) - affordable for x10 multiplier
const calculateShinyCost = (helper: PokemonHelper): number => {
  return Math.floor(helper.baseCost * 2 * Math.pow(1.3, 30));
};

// Export for components
// eslint-disable-next-line react-refresh/only-export-components
export { calculateShinyCost };

// Get active production multiplier from boosts
const getProductionMultiplier = (activeBoosts: ActiveBoost[]): number => {
  const productionBoost = activeBoosts.find(b => b.type === 'PRODUCTION_MULTIPLIER');
  return productionBoost ? productionBoost.value : 1;
};

// Calculate energy per second with new balanced system
// Global bonus is additive (sum of percentages), not multiplicative
// Optimized: cache helper multipliers and reduce iterations
const calculateEnergyPerSecond = (helpers: PokemonHelper[], upgrades: Upgrade[], activeBoosts: ActiveBoost[] = []) => {
  // Pre-calculate global bonuses once
  let globalPercentBonus = 0;
  let legacyMultiplier = 1;
  const purchasedUpgrades = upgrades.filter(u => u.purchased);
  
  for (const u of purchasedUpgrades) {
    if (u.type === 'GLOBAL_PERCENT') {
      globalPercentBonus += u.value;
    } else if (u.type === 'GLOBAL_MULTIPLIER') {
      legacyMultiplier *= u.value;
    }
  }
  
  // Pre-calculate helper multipliers map for performance
  const helperMultipliers = new Map<string, number>();
  for (const u of purchasedUpgrades) {
    if (u.type === 'HELPER_MULTIPLIER' && u.targetId) {
      const current = helperMultipliers.get(u.targetId) || 1;
      helperMultipliers.set(u.targetId, current * u.value);
    }
  }

  // Calculate base production from all helpers
  let baseProduction = 0;
  for (const h of helpers) {
    if (h.count === 0) continue; // Skip helpers with 0 count
    
    // Get effective base (original + HELPER_BASE upgrades)
    const effectiveBase = getHelperEffectiveBase(h, purchasedUpgrades);
    
    // Shiny multiplier (x10 if shiny)
    const shinyMultiplier = h.isShiny ? 10 : 1;
    
    // Get helper multiplier from cache
    const helperMultiplier = helperMultipliers.get(h.id) || 1;
    
    baseProduction += effectiveBase * h.count * helperMultiplier * shinyMultiplier;
  }

  // Apply global bonus: base * (1 + percentage/100) * legacyMultiplier
  const baseValue = baseProduction * (1 + globalPercentBonus / 100) * legacyMultiplier;
  const boostMultiplier = getProductionMultiplier(activeBoosts);
  
  return baseValue * boostMultiplier;
};

// Auto-unlock helpers based on totalEnergy
// A helper is unlocked when totalEnergy reaches 50% of its baseCost
// Optimized: only creates new array if something actually changed
const autoUnlockHelpers = (helpers: PokemonHelper[], totalEnergy: number): PokemonHelper[] => {
  let hasChanges = false;
  const newHelpers = helpers.map(helper => {
    if (helper.unlocked) return helper;
    
    // Unlock if totalEnergy reaches 50% of baseCost
    const unlockThreshold = helper.baseCost * 0.5;
    if (totalEnergy >= unlockThreshold) {
      hasChanges = true;
      return { ...helper, unlocked: true };
    }
    
    return helper;
  });
  
  // Only return new array if something changed
  return hasChanges ? newHelpers : helpers;
};

const gameReducer = (state: GameState, action: ClickerAction): GameState => {
  switch (action.type) {
    case 'BUY_HELPER': {
      const { helperId } = action.payload;
      const helperIndex = state.helpers.findIndex(h => h.id === helperId);
      
      if (helperIndex === -1) return state;
      
      const helper = state.helpers[helperIndex];
      // Calculate dynamic cost based on count and production
      const cost = calculateHelperCost(helper, state.energyPerSecond);
      
      if (state.energy < cost) return state;
      
      const newHelpers = [...state.helpers];
      newHelpers[helperIndex] = {
        ...helper,
        count: helper.count + 1,
      };
      
      const newEnergyPerSecond = calculateEnergyPerSecond(newHelpers, state.upgrades, state.activeBoosts);
      const unlockedHelpers = autoUnlockHelpers(newHelpers, state.totalEnergy);
      
      return {
        ...state,
        energy: state.energy - cost,
        helpers: unlockedHelpers,
        energyPerSecond: newEnergyPerSecond,
      };
    }
    case 'BUY_UPGRADE': {
      const { upgradeId } = action.payload;
      const upgradeIndex = state.upgrades.findIndex(u => u.id === upgradeId);
      
      if (upgradeIndex === -1) return state;
      
      const upgrade = state.upgrades[upgradeIndex];
      if (upgrade.purchased || state.energy < upgrade.cost) return state;
      
      const newUpgrades = [...state.upgrades];
      newUpgrades[upgradeIndex] = {
        ...upgrade,
        purchased: true,
      };
      
      return {
        ...state,
        energy: state.energy - upgrade.cost,
        upgrades: newUpgrades,
        energyPerClick: calculateEnergyPerClick(newUpgrades, state.activeBoosts),
        energyPerSecond: calculateEnergyPerSecond(state.helpers, newUpgrades, state.activeBoosts),
      };
    }
    case 'CLICK': {
      const newTotalEnergy = state.totalEnergy + state.energyPerClick;
      const unlockedHelpers = autoUnlockHelpers(state.helpers, newTotalEnergy);
      return {
        ...state,
        energy: state.energy + state.energyPerClick,
        totalEnergy: newTotalEnergy,
        clickCount: state.clickCount + 1,
        helpers: unlockedHelpers,
      };
    }
    case 'TICK': {
      const { delta } = action.payload;
      const energyGain = state.energyPerSecond * delta;
      const newTotalEnergy = state.totalEnergy + energyGain;
      const unlockedHelpers = autoUnlockHelpers(state.helpers, newTotalEnergy);
      return {
        ...state,
        energy: state.energy + energyGain,
        totalEnergy: newTotalEnergy,
        lastSaveTime: Date.now(),
        helpers: unlockedHelpers,
      };
    }
    case 'ADD_ENERGY': {
      const newTotalEnergy = state.totalEnergy + action.payload.amount;
      const unlockedHelpers = autoUnlockHelpers(state.helpers, newTotalEnergy);
      return {
        ...state,
        energy: state.energy + action.payload.amount,
        totalEnergy: newTotalEnergy,
        helpers: unlockedHelpers,
      };
    }
    case 'LOAD_GAME':
      // Merge saved helpers with initial helpers to ensure new helpers are added
      // and new properties (like pokemonId) are preserved from initial config
      const savedHelpers = action.payload.helpers || [];
      const mergedHelpers = INITIAL_HELPERS.map(initialHelper => {
        const savedHelper = savedHelpers.find(h => h.id === initialHelper.id);
        // Merge saved data with initial config to preserve new properties like pokemonId and isShiny
        return savedHelper
          ? { ...initialHelper, count: savedHelper.count, unlocked: savedHelper.unlocked, isShiny: savedHelper.isShiny || false }
          : initialHelper;
      });

      // Merge saved upgrades
      const savedUpgrades = action.payload.upgrades || [];
      const mergedUpgrades = INITIAL_UPGRADES.map(initialUpgrade => {
        const savedUpgrade = savedUpgrades.find(u => u.id === initialUpgrade.id);
        return savedUpgrade ? { ...initialUpgrade, purchased: savedUpgrade.purchased } : initialUpgrade;
      });

      const finalHelpers = autoUnlockHelpers(mergedHelpers, action.payload.totalEnergy || 0);
      
      return {
        ...state,
        ...action.payload,
        helpers: finalHelpers,
        upgrades: mergedUpgrades,
        activeBoosts: action.payload.activeBoosts || [],
        boostCooldowns: action.payload.boostCooldowns || [],
        energyPerClick: calculateEnergyPerClick(mergedUpgrades, action.payload.activeBoosts || []),
        energyPerSecond: calculateEnergyPerSecond(finalHelpers, mergedUpgrades, action.payload.activeBoosts || []),
      };
    case 'RESET_GAME':
      return {
        ...initialState,
        lastSaveTime: Date.now(),
      };
    case 'MAKE_SHINY': {
      const { helperId } = action.payload;
      const helperIndex = state.helpers.findIndex(h => h.id === helperId);
      
      if (helperIndex === -1) return state;
      
      const helper = state.helpers[helperIndex];
      
      // Can't make shiny if already shiny or no count
      if (helper.isShiny || helper.count === 0) return state;
      
      const cost = calculateShinyCost(helper);
      if (state.energy < cost) return state;
      
      const newHelpers = [...state.helpers];
      newHelpers[helperIndex] = {
        ...helper,
        isShiny: true,
      };
      
      const newEnergyPerSecond = calculateEnergyPerSecond(newHelpers, state.upgrades, state.activeBoosts);
      
      return {
        ...state,
        energy: state.energy - cost,
        helpers: newHelpers,
        energyPerSecond: newEnergyPerSecond,
      };
    }
    case 'ACTIVATE_BOOST': {
      const { boostId } = action.payload;
      const boost = AVAILABLE_BOOSTS.find(b => b.id === boostId);
      
      if (!boost) return state;
      
      // Check if boost is on cooldown
      const cooldown = state.boostCooldowns.find(c => c.boostId === boostId);
      if (cooldown && Date.now() < cooldown.availableAt) {
        return state; // Still on cooldown
      }
      
      // Calculate dynamic cost based on current production
      const dynamicCost = calculateBoostCost(boost, state.energyPerSecond);
      
      // Check if player has enough energy
      if (state.energy < dynamicCost) return state;
      
      const now = Date.now();
      let newActiveBoosts = [...state.activeBoosts];
      let newBoostCooldowns = [...state.boostCooldowns];
      
      // Handle instant energy boost
      if (boost.type === 'INSTANT_ENERGY') {
        const energyGain = Math.floor(state.totalEnergy * boost.value);
        const newTotalEnergy = state.totalEnergy + energyGain;
        const unlockedHelpers = autoUnlockHelpers(state.helpers, newTotalEnergy);
        
        // Add cooldown
        const cooldownIndex = newBoostCooldowns.findIndex(c => c.boostId === boostId);
        if (cooldownIndex >= 0) {
          newBoostCooldowns[cooldownIndex] = {
            boostId,
            availableAt: now + boost.cooldown * 1000,
          };
        } else {
          newBoostCooldowns.push({
            boostId,
            availableAt: now + boost.cooldown * 1000,
          });
        }
        
        return {
          ...state,
          energy: state.energy - dynamicCost + energyGain,
          totalEnergy: newTotalEnergy,
          boostCooldowns: newBoostCooldowns,
          helpers: unlockedHelpers,
        };
      }
      
      // Handle temporary boosts (replace existing boost of same type if any)
      if (boost.duration > 0) {
        // Remove existing boost of same type
        newActiveBoosts = newActiveBoosts.filter(b => b.type !== boost.type);
        
        // Add new boost
        newActiveBoosts.push({
          boostId: boost.id,
          type: boost.type,
          value: boost.value,
          expiresAt: now + boost.duration * 1000,
          startTime: now,
        });
      }
      
      // Add cooldown
      const cooldownIndex = newBoostCooldowns.findIndex(c => c.boostId === boostId);
      if (cooldownIndex >= 0) {
        newBoostCooldowns[cooldownIndex] = {
          boostId,
          availableAt: now + boost.cooldown * 1000,
        };
      } else {
        newBoostCooldowns.push({
          boostId,
          availableAt: now + boost.cooldown * 1000,
        });
      }
      
      // Recalculate stats with new boosts
      const newEnergyPerClick = calculateEnergyPerClick(state.upgrades, newActiveBoosts);
      const newEnergyPerSecond = calculateEnergyPerSecond(state.helpers, state.upgrades, newActiveBoosts);
      
      return {
        ...state,
        energy: state.energy - dynamicCost,
        activeBoosts: newActiveBoosts,
        boostCooldowns: newBoostCooldowns,
        energyPerClick: newEnergyPerClick,
        energyPerSecond: newEnergyPerSecond,
      };
    }
    case 'CLEANUP_EXPIRED_BOOSTS': {
      const now = Date.now();
      const activeBoosts = state.activeBoosts.filter(b => b.expiresAt > now);
      
      // Only update if something changed
      if (activeBoosts.length === state.activeBoosts.length) {
        return state;
      }
      
      // Recalculate stats without expired boosts
      const newEnergyPerClick = calculateEnergyPerClick(state.upgrades, activeBoosts);
      const newEnergyPerSecond = calculateEnergyPerSecond(state.helpers, state.upgrades, activeBoosts);
      
      return {
        ...state,
        activeBoosts,
        energyPerClick: newEnergyPerClick,
        energyPerSecond: newEnergyPerSecond,
      };
    }
    default:
      return state;
  }
};

// Export helper function for components to use
export { getHelperEffectiveBase };

export const ClickerContext = createContext<{
  state: GameState;
  dispatch: Dispatch<ClickerAction>;
  resetGame: () => void;
}>({
  state: initialState,
  dispatch: () => null,
  resetGame: () => null,
});

const SAVE_KEY = 'pokeclicker_save';
const SAVE_INTERVAL = 5000; // 5 seconds
const TICK_INTERVAL = 100; // 10 ticks per second

export const ClickerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Keep state ref in sync for auto-save
  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Load game on mount
  React.useEffect(() => {
    const savedState = localStorage.getItem(SAVE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Calculate offline progress
        const now = Date.now();
        const lastSaveTime = parsedState.lastSaveTime || now;
        const timeDiff = (now - lastSaveTime) / 1000; // seconds
        
        if (timeDiff > 0 && parsedState.energyPerSecond > 0) {
          const offlineEnergy = parsedState.energyPerSecond * timeDiff;
          parsedState.energy += offlineEnergy;
          parsedState.totalEnergy += offlineEnergy;
          console.log(`Offline progress: +${offlineEnergy.toFixed(1)} energy (${timeDiff.toFixed(1)}s)`);
        }

        dispatch({ type: 'LOAD_GAME', payload: parsedState });
      } catch (error) {
        console.error('Failed to load save game:', error);
      }
    }
  }, []);

  // Save game periodically
  React.useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        ...stateRef.current,
        lastSaveTime: Date.now(),
      }));
    }, SAVE_INTERVAL);

    return () => clearInterval(saveInterval);
  }, []);

  const resetGame = () => {
    localStorage.removeItem(SAVE_KEY);
    dispatch({ type: 'RESET_GAME' });
  };

  // Cleanup expired boosts periodically
  React.useEffect(() => {
    const cleanupInterval = setInterval(() => {
      dispatch({ type: 'CLEANUP_EXPIRED_BOOSTS' });
    }, 1000); // Check every second

    return () => clearInterval(cleanupInterval);
  }, []);

  // Auto-clicker logic
  React.useEffect(() => {
    const autoClickerBoost = state.activeBoosts.find(b => b.type === 'AUTO_CLICKER');
    if (!autoClickerBoost) return;

    const clicksPerSecond = autoClickerBoost.value;
    const interval = 1000 / clicksPerSecond; // ms between clicks

    const autoClickInterval = setInterval(() => {
      dispatch({ type: 'CLICK' });
    }, interval);

    return () => clearInterval(autoClickInterval);
  }, [state.activeBoosts, dispatch]);

  // Game Loop
  const lastTickRef = React.useRef<number>(Date.now());
  const lastDispatchRef = React.useRef<number>(Date.now());
  const accumulatedDeltaRef = React.useRef<number>(0);

  React.useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000; // Convert to seconds
      lastTickRef.current = now;

      // Accumulate delta time
      accumulatedDeltaRef.current += delta;

      // Only dispatch if enough time has passed
      const timeSinceLastDispatch = now - lastDispatchRef.current;
      if (timeSinceLastDispatch >= TICK_INTERVAL && accumulatedDeltaRef.current > 0) {
        dispatch({ type: 'TICK', payload: { delta: accumulatedDeltaRef.current } });
        accumulatedDeltaRef.current = 0;
        lastDispatchRef.current = now;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    lastTickRef.current = Date.now();
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <ClickerContext.Provider value={{ state, dispatch, resetGame }}>
      {children}
    </ClickerContext.Provider>
  );
};