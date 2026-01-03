import type { Difficulty, GameMode, GameSettings } from '../types/game';

export const DIFFICULTIES: Record<Difficulty, { label: string; blur: number; rotate: boolean }> = {
  facile: { label: 'Facile', blur: 0, rotate: false },
  normale: { label: 'Normale', blur: 0, rotate: false },
  hyper: { label: 'Hyper', blur: 10, rotate: false },
  master: { label: 'Master', blur: 20, rotate: false },
};

export const GAME_MODES: Record<GameMode, { label: string; description: string }> = {
  classic: { label: 'Classique', description: 'Devinez le Pokémon à votre rythme' },
  time_attack: { label: 'Contre-la-montre', description: '60 secondes pour en trouver le plus possible' },
  survival: { label: 'Survie', description: 'Le jeu s\'arrête à la première erreur' },
  blur: { label: 'Flou', description: 'L\'image devient de plus en plus nette' },
  cry: { label: 'Cri', description: 'Devinez le Pokémon uniquement au son' },
};

export const DEFAULT_SETTINGS: GameSettings = {
  mode: 'classic',
  generation: 0, // 0 = All
  difficulty: 'normale',
  soundEnabled: true,
  cryVolume: 0.5,
};

export const TIME_ATTACK_DURATION = 60; // seconds
export const BLUR_STEPS = 5; // Number of steps to unblur
export const MAX_BLUR = 20; // Max blur in px

// Reveal duration in milliseconds
export const REVEAL_DURATION_CORRECT = 2000; // 2 seconds for correct answers
export const REVEAL_DURATION_WRONG = 2000; // 2 seconds for wrong answers / give up

export const INITIAL_STATS = {
  currentStreak: 0,
  bestStreak: 0,
  correctCount: 0,
  totalCount: 0,
  lastTime: null,
  averageTime: 0,
};