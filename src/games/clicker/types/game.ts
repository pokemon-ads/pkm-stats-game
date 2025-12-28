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
  isShiny?: boolean;  // Shiny status - gives x10 production
  level: number;  // Current level (0-252)
  ev: number;  // Available EV points
  unlockedSkills: string[];  // IDs of unlocked skills
}

export type StarterHelper = Pick<PokemonHelper, 'id' | 'name'| 'evolutions'| 'pokemonId'>;

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
  itemImage?: string; // URL to item image from PokeAPI
  category?: string;
}

export interface Boost {
  id: string;
  name: string;
  description: string;
  baseCost: number; // Base cost, will be scaled based on production
  costMultiplier: number; // Multiplier for scaling (higher = more expensive as production increases)
  type: 'CLICK_MULTIPLIER' | 'PRODUCTION_MULTIPLIER' | 'INSTANT_ENERGY' | 'AUTO_CLICKER';
  value: number; // Multiplier value or energy amount
  duration: number; // Duration in seconds (0 for instant)
  cooldown: number; // Cooldown in seconds
  icon: string;
}

export interface ActiveBoost {
  boostId: string;
  type: Boost['type'];
  value: number;
  expiresAt: number; // Timestamp when boost expires
  startTime: number; // Timestamp when boost started
}

export interface BoostCooldown {
  boostId: string;
  availableAt: number; // Timestamp when boost becomes available again
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cost: number;  // Cost in EV points
  type: 'PRODUCTION_BONUS' | 'PRODUCTION_MULTIPLIER' | 'SPECIAL';
  value: number;  // Effect value
  prerequisites?: string[];  // IDs of required skills
  icon?: string;  // Optional icon
  position?: { x: number; y: number };  // Position in skill tree UI
}

export interface SkillTree {
  helperId: string;
  skills: Skill[];
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
  activeBoosts: ActiveBoost[];
  boostCooldowns: BoostCooldown[];
}

export type ClickerAction =
  | { type: 'CLICK' }
  | { type: 'TICK'; payload: { delta: number } }
  | { type: 'ADD_ENERGY'; payload: { amount: number } }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'RESET_GAME' }
  | { type: 'BUY_HELPER'; payload: { helperId: string; quantity?: number } }
  | { type: 'BUY_UPGRADE'; payload: { upgradeId: string } }
  | { type: 'MAKE_SHINY'; payload: { helperId: string } }
  | { type: 'ACTIVATE_BOOST'; payload: { boostId: string } }
  | { type: 'CLEANUP_EXPIRED_BOOSTS' }
  | { type: 'UNLOCK_SKILL'; payload: { helperId: string; skillId: string } };