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

const calculateEnergyPerClick = (upgrades: Upgrade[]) => {
  let multiplier = 1;
  upgrades.forEach(u => {
    if (u.purchased && u.type === 'CLICK_MULTIPLIER') {
      multiplier *= u.value;
    }
  });
  return 1 * multiplier;
};

const calculateEnergyPerSecond = (helpers: PokemonHelper[], upgrades: Upgrade[]) => {
  let globalMultiplier = 1;
  upgrades.forEach(u => {
    if (u.purchased && u.type === 'GLOBAL_MULTIPLIER') {
      globalMultiplier *= u.value;
    }
  });

  const baseProduction = helpers.reduce((total, h) => {
    let helperMultiplier = 1;
    upgrades.forEach(u => {
      if (u.purchased && u.type === 'HELPER_MULTIPLIER' && u.targetId === h.id) {
        helperMultiplier *= u.value;
      }
    });
    return total + (h.baseProduction * h.count * helperMultiplier);
  }, 0);

  return baseProduction * globalMultiplier;
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
      
      return {
        ...state,
        energy: state.energy - cost,
        helpers: newHelpers,
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
    case 'CLICK':
      return {
        ...state,
        energy: state.energy + state.energyPerClick,
        totalEnergy: state.totalEnergy + state.energyPerClick,
        clickCount: state.clickCount + 1,
      };
    case 'TICK':
      const { delta } = action.payload;
      const energyGain = state.energyPerSecond * delta;
      return {
        ...state,
        energy: state.energy + energyGain,
        totalEnergy: state.totalEnergy + energyGain,
        lastSaveTime: Date.now(),
      };
    case 'ADD_ENERGY':
      return {
        ...state,
        energy: state.energy + action.payload.amount,
        totalEnergy: state.totalEnergy + action.payload.amount,
      };
    case 'LOAD_GAME':
      // Merge saved helpers with initial helpers to ensure new helpers are added
      // and new properties (like pokemonId) are preserved from initial config
      const savedHelpers = action.payload.helpers || [];
      const mergedHelpers = INITIAL_HELPERS.map(initialHelper => {
        const savedHelper = savedHelpers.find(h => h.id === initialHelper.id);
        // Merge saved data with initial config to preserve new properties like pokemonId
        return savedHelper
          ? { ...initialHelper, count: savedHelper.count, unlocked: savedHelper.unlocked }
          : initialHelper;
      });

      // Merge saved upgrades
      const savedUpgrades = action.payload.upgrades || [];
      const mergedUpgrades = INITIAL_UPGRADES.map(initialUpgrade => {
        const savedUpgrade = savedUpgrades.find(u => u.id === initialUpgrade.id);
        return savedUpgrade ? { ...initialUpgrade, purchased: savedUpgrade.purchased } : initialUpgrade;
      });

      return {
        ...state,
        ...action.payload,
        helpers: mergedHelpers,
        upgrades: mergedUpgrades,
        energyPerClick: calculateEnergyPerClick(mergedUpgrades),
        energyPerSecond: calculateEnergyPerSecond(mergedHelpers, mergedUpgrades),
      };
    case 'RESET_GAME':
      return {
        ...initialState,
        lastSaveTime: Date.now(),
      };
    default:
      return state;
  }
};

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

  return (
    <ClickerContext.Provider value={{ state, dispatch, resetGame }}>
      {children}
    </ClickerContext.Provider>
  );
};