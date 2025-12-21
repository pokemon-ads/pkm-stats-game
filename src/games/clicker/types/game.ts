export interface PokemonEvolution {
  level: number;      // Count threshold to evolve
  pokemonId: number;  // New Pokemon ID
  name: string;       // New name
}

export interface PokemonHelper {
  id: string;
  name: string;
  baseCost: number;
  baseProduction: number;
  count: number;
  unlocked: boolean;
  pokemonId?: number;
  evolutions?: PokemonEvolution[];  // Evolution chain
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'CLICK_BONUS' | 'CLICK_MULTIPLIER' | 'GLOBAL_PERCENT' | 'GLOBAL_MULTIPLIER' | 'HELPER_BASE' | 'HELPER_MULTIPLIER';
  targetId?: string;
  value: number;
  condition?: {
    type: 'HELPER_COUNT' | 'TOTAL_ENERGY' | 'EVOLUTION';
    targetId?: string;
    amount: number;
    evolutionName?: string;  // Name of the evolution required
  };
  purchased: boolean;
  icon?: string;
  category?: string;
}

export interface GameState {
  energy: number;
  totalEnergy: number;
  clickCount: number;
  energyPerClick: number;
  energyPerSecond: number;
  lastSaveTime: number;
  helpers: PokemonHelper[];
  upgrades: Upgrade[];
}

export type ClickerAction =
  | { type: 'CLICK' }
  | { type: 'TICK'; payload: { delta: number } }
  | { type: 'ADD_ENERGY'; payload: { amount: number } }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'RESET_GAME' }
  | { type: 'BUY_HELPER'; payload: { helperId: string } }
  | { type: 'BUY_UPGRADE'; payload: { upgradeId: string } };