import type { Difficulty } from '../types/game';

export const DIFFICULTIES: Record<Difficulty, { label: string; blur: number; rotate: boolean }> = {
  facile: { label: 'Facile', blur: 0, rotate: false },
  normale: { label: 'Normale', blur: 0, rotate: false },
  hyper: { label: 'Hyper', blur: 10, rotate: false },
  master: { label: 'Master', blur: 20, rotate: false },
};

export const DEFAULT_SETTINGS = {
  generation: 0, // 0 = All
  difficulty: 'normale' as Difficulty,
  soundEnabled: true,
};

export const INITIAL_STATS = {
  currentStreak: 0,
  bestStreak: 0,
  correctCount: 0,
  totalCount: 0,
  lastTime: null,
  averageTime: 0,
};