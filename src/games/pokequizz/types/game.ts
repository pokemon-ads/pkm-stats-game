import type { Pokemon } from '../../../types/pokemon';

export type Difficulty = 'facile' | 'normale' | 'hyper' | 'master';

export type GameMode = 'classic' | 'time_attack' | 'survival' | 'blur' | 'cry';

export interface GameSettings {
  mode: GameMode;
  generation: number; // 0 for all, 1-9 for specific
  difficulty: Difficulty;
  soundEnabled: boolean;
}

export interface GameStats {
  currentStreak: number;
  bestStreak: number;
  correctCount: number;
  totalCount: number;
  lastTime: number | null; // in ms
  averageTime: number; // in ms
}

export type GameStatus = 'loading' | 'playing' | 'revealed';

export interface GameState {
  status: GameStatus;
  currentPokemon: Pokemon | null;
  startTime: number | null;
  userGuess: string;
  isCorrect: boolean | null; // null if not guessed yet
  timeLeft?: number; // For time attack
  lives?: number; // For survival
}