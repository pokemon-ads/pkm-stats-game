/**
 * Application Configuration Constants
 * Centralized location for all magic strings and numbers
 */

// ============================================================================
// GAME CONFIGURATION
// ============================================================================

export const GAME_CONFIG = {
  // Default target score
  DEFAULT_TARGET_TOTAL: 600,
  
  // Target score constraints
  MIN_TARGET_TOTAL: 100,
  MAX_TARGET_TOTAL: 1000,
  TARGET_STEP: 50,
  
  // Number of rounds per game
  ROUNDS_PER_GAME: 6,
  
  // Shiny Pokemon probability (1 in X)
  SHINY_PROBABILITY: 128,
  
  // Shiny bonus multiplier
  SHINY_BONUS_MULTIPLIER: 2,
  
  // Auto-draw delay after revealing stats (milliseconds)
  AUTO_DRAW_DELAY: 3000,
  
  // Max attempts to fetch a valid Pokemon
  MAX_FETCH_ATTEMPTS: 50,
  
  // Retry delay after failed fetch (milliseconds)
  RETRY_DELAY: 1000,
} as const

// ============================================================================
// POKEMON DATA
// ============================================================================

export { POKEMON_CONFIG } from '../../../config/constants'

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  SKIP_CONFIRMATION: 'pkstats-skip-confirmation',
  SHINY_BONUS: 'pkstats-shiny-bonus',
} as const

// ============================================================================
// STAT NAMES
// ============================================================================

export const STAT_NAMES = {
  HP: 'hp',
  ATTACK: 'attack',
  DEFENSE: 'defense',
  SPECIAL_ATTACK: 'special-attack',
  SPECIAL_DEFENSE: 'special-defense',
  SPEED: 'speed',
} as const

export const STAT_DISPLAY_NAMES: Record<string, string> = {
  [STAT_NAMES.HP]: 'HP',
  [STAT_NAMES.ATTACK]: 'Attaque',
  [STAT_NAMES.DEFENSE]: 'Défense',
  [STAT_NAMES.SPECIAL_ATTACK]: 'Att. Spé',
  [STAT_NAMES.SPECIAL_DEFENSE]: 'Déf. Spé',
  [STAT_NAMES.SPEED]: 'Vitesse',
} as const

// Stat order for display
export const STAT_ORDER = [
  STAT_NAMES.HP,
  STAT_NAMES.ATTACK,
  STAT_NAMES.DEFENSE,
  STAT_NAMES.SPECIAL_ATTACK,
  STAT_NAMES.SPECIAL_DEFENSE,
  STAT_NAMES.SPEED,
] as const

// ============================================================================
// FILTER MODES
// ============================================================================

export const FILTER_MODES = {
  AND: 'AND',
  OR: 'OR',
} as const

export type FilterMode = typeof FILTER_MODES[keyof typeof FILTER_MODES]

// ============================================================================
// GAME PHASES
// ============================================================================

export const GAME_PHASES = {
  SETUP: 'setup',
  PLAYING: 'playing',
  RESULT: 'result',
} as const

export type GamePhase = typeof GAME_PHASES[keyof typeof GAME_PHASES]

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  // Sidebar widths
  SIDEBAR_WIDTH_EXPANDED: 260,
  SIDEBAR_WIDTH_COLLAPSED: 55,
  
  // Animation durations (milliseconds)
  ANIMATION_DURATION: 300,
  
  // Z-index layers
  Z_INDEX: {
    SIDEBAR: 100,
    MODAL: 1000,
  },
} as const

// ============================================================================
// ADJUSTMENT VALUES
// ============================================================================

export const ADJUSTMENT_VALUES = {
  SMALL: 50,
  LARGE: 100,
} as const

// ============================================================================
// TYPE ICONS
// ============================================================================

export const TYPE_ICONS: Record<string, string> = {
  normal: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/1.png',
  fighting: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/2.png',
  flying: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/3.png',
  poison: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/4.png',
  ground: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/5.png',
  rock: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/6.png',
  bug: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/7.png',
  ghost: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/8.png',
  steel: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/9.png',
  fire: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/10.png',
  water: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/11.png',
  grass: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/12.png',
  electric: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/13.png',
  psychic: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/14.png',
  ice: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/15.png',
  dragon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/16.png',
  dark: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/17.png',
  fairy: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/18.png',
} as const

// ============================================================================
// REGIONAL FORM ICONS
// ============================================================================

export const REGIONAL_FORM_ICONS: Record<string, string> = {
  alola: '🏝️',
  galar: '🏰',
  hisui: '⛰️',
  paldea: '🌮',
} as const

// ============================================================================
// SPECIAL CATEGORY ICONS
// ============================================================================

export const CATEGORY_ICONS = {
  LEGENDARY: '👑',
  MYTHICAL: '🌟',
  ULTRA_BEAST: '👾',
  PARADOX: '⏳',
  MEGA: '💎',
  GIGANTAMAX: '⭐',
  LEGENDS_ZA: '🅰️',
} as const