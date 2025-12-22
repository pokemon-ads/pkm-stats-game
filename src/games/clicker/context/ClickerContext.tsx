import React, { createContext, useReducer } from 'react';
import type { ReactNode, Dispatch } from 'react';
import type { GameState, ClickerAction, Upgrade, PokemonHelper } from '../types/game';
import { INITIAL_HELPERS } from '../config/helpers';
import { INITIAL_UPGRADES } from '../config/upgrades';

const initialState: GameState = {
  energy: 0,
  totalEnergy: 0,
  clickCount: 0,
  energyPerClick: 1,
  energyPerSecond: 0,
  lastSaveTime: Date.now(),
  helpers: INITIAL_HELPERS,
  upgrades: INITIAL_UPGRADES,
};

// Calculate click power with new balanced system
// Base click = 1, then add all CLICK_BONUS values
const calculateEnergyPerClick = (upgrades: Upgrade[]) => {
  let baseClick = 1;
  let clickBonus = 0;
  
  upgrades.forEach(u => {
    if (u.purchased) {
      if (u.type === 'CLICK_BONUS') {
        clickBonus += u.value;
      } else if (u.type === 'CLICK_MULTIPLIER') {
        // Legacy support - still multiply if old type exists
        baseClick *= u.value;
      }
    }
  });
  
  return baseClick + clickBonus;
};

// Calculate helper's effective base production (original + upgrades)
const getHelperEffectiveBase = (helper: PokemonHelper, upgrades: Upgrade[]): number => {
  let effectiveBase = helper.baseProduction;
  
  // Add all HELPER_BASE bonuses for this helper
  upgrades.forEach(u => {
    if (u.purchased && u.type === 'HELPER_BASE' && u.targetId === helper.id) {
      effectiveBase += u.value;
    }
  });
  
  return effectiveBase;
};

// Calculate shiny cost for a helper
// Cost = baseCost * 50 * (1.3 ^ count) - affordable for x10 multiplier
const calculateShinyCost = (helper: PokemonHelper): number => {
  return Math.floor(helper.baseCost * 2 * Math.pow(1.3, 30));
};

// Export for components
export { calculateShinyCost };

// Calculate energy per second with new balanced system
// Global bonus is additive (sum of percentages), not multiplicative
const calculateEnergyPerSecond = (helpers: PokemonHelper[], upgrades: Upgrade[]) => {
  // Calculate global percentage bonus (additive)
  let globalPercentBonus = 0;
  upgrades.forEach(u => {
    if (u.purchased && u.type === 'GLOBAL_PERCENT') {
      globalPercentBonus += u.value;
    }
  });
  
  // Legacy support for old GLOBAL_MULTIPLIER
  let legacyMultiplier = 1;
  upgrades.forEach(u => {
    if (u.purchased && u.type === 'GLOBAL_MULTIPLIER') {
      legacyMultiplier *= u.value;
    }
  });

  // Calculate base production from all helpers
  const baseProduction = helpers.reduce((total, h) => {
    // Get effective base (original + HELPER_BASE upgrades)
    const effectiveBase = getHelperEffectiveBase(h, upgrades);
    
    // Shiny multiplier (x10 if shiny)
    const shinyMultiplier = h.isShiny ? 10 : 1;
    
    // Legacy support for HELPER_MULTIPLIER
    let helperMultiplier = 1;
    upgrades.forEach(u => {
      if (u.purchased && u.type === 'HELPER_MULTIPLIER' && u.targetId === h.id) {
        helperMultiplier *= u.value;
      }
    });
    
    return total + (effectiveBase * h.count * helperMultiplier * shinyMultiplier);
  }, 0);

  // Apply global bonus: base * (1 + percentage/100) * legacyMultiplier
  return baseProduction * (1 + globalPercentBonus / 100) * legacyMultiplier;
};

// Auto-unlock helpers based on totalEnergy
// A helper is unlocked when totalEnergy reaches 50% of its baseCost
const autoUnlockHelpers = (helpers: PokemonHelper[], totalEnergy: number): PokemonHelper[] => {
  return helpers.map(helper => {
    if (helper.unlocked) return helper;
    
    // Unlock if totalEnergy reaches 50% of baseCost
    const unlockThreshold = helper.baseCost * 0.5;
    if (totalEnergy >= unlockThreshold) {
      return { ...helper, unlocked: true };
    }
    
    return helper;
  });
};

const gameReducer = (state: GameState, action: ClickerAction): GameState => {
  switch (action.type) {
    case 'BUY_HELPER': {
      const { helperId } = action.payload;
      const helperIndex = state.helpers.findIndex(h => h.id === helperId);
      
      if (helperIndex === -1) return state;
      
      const helper = state.helpers[helperIndex];
      const cost = Math.floor(helper.baseCost * Math.pow(1.15, helper.count));
      
      if (state.energy < cost) return state;
      
      const newHelpers = [...state.helpers];
      newHelpers[helperIndex] = {
        ...helper,
        count: helper.count + 1,
      };
      
      const newEnergyPerSecond = calculateEnergyPerSecond(newHelpers, state.upgrades);
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
        energyPerClick: calculateEnergyPerClick(newUpgrades),
        energyPerSecond: calculateEnergyPerSecond(state.helpers, newUpgrades),
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
        energyPerClick: calculateEnergyPerClick(mergedUpgrades),
        energyPerSecond: calculateEnergyPerSecond(finalHelpers, mergedUpgrades),
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
      
      const newEnergyPerSecond = calculateEnergyPerSecond(newHelpers, state.upgrades);
      
      return {
        ...state,
        energy: state.energy - cost,
        helpers: newHelpers,
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