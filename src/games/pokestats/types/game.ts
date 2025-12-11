import type { Pokemon, StatName } from '../../../types/pokemon'

export interface GameState {
  phase: 'setup' | 'playing' | 'result'
  targetTotal: number
  currentRound: number
  selectedStats: Array<{
    pokemon: Pokemon
    statName: StatName
    value: number
  }>
  currentPokemon: Pokemon | null
  availableStats: StatName[]
  selectedStatName: StatName | null  // Stat choisie mais pas encore confirmée
  statsRevealed: boolean
}

export interface FilterOptions {
  generations?: number[]  // Changed to array for multiple selection
  types?: string[]  // Changed to array for multiple selection
  legendary?: boolean
  mythical?: boolean
  mega?: boolean
  gigantamax?: boolean
  ultraBeast?: boolean
  legendsZA?: boolean
  paradox?: boolean  // New: Paradox Pokemon filter
  regionalForms?: ('alola' | 'galar' | 'hisui' | 'paldea')[]  // Changed to array for multiple selection
  filterMode?: 'AND' | 'OR'  // Filter combination mode (AND = restrictive, OR = additive)
  
  // Legacy single-value support (for backward compatibility)
  generation?: number
  type?: string
  regionalForm?: 'alola' | 'galar' | 'hisui' | 'paldea'
}