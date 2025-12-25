import type { PokemonHelper, StarterHelper } from '../types/game';
import { HELPERS_SCALING } from './helper-scaling';
import { ALL_STARTERS } from './helper/starters';
import { ALL_POPULARS } from './helper/populars';
import { ALL_POWERHOUSE } from './helper/powerhouse';
import { ALL_LEGENDARIES } from './helper/legendaries';

// Calculate dynamic helper cost based on count and current production
// Formula: baseCost * (1.15^count) * (1 + log(1 + energyPerSecond / baseProduction) * costMultiplier)
// Combines exponential growth per purchase with logarithmic scaling based on production
// Adjusted to balance the powerful first helper purchase
export const calculateHelperCost = (helper: PokemonHelper, energyPerSecond: number): number => {
  // Base production threshold for scaling (increased to account for higher production)
  const baseProduction = 200;
  
  // Exponential growth per purchase - slightly increased to balance powerful first helper
  // This ensures subsequent helpers remain expensive after the impactful first purchase
  const countMultiplier = Math.pow(1.18, helper.count);
  
  // Logarithmic scaling based on production (similar to boosts but gentler)
  const productionRatio = Math.max(0, energyPerSecond / baseProduction);
  const logFactor = Math.log1p(productionRatio);
  
  // Cost multiplier based on helper tier (higher tier = more scaling)
  // Lower tier helpers (early game) have less scaling, higher tier have more
  const tierMultiplier = getHelperTierMultiplier(helper);
  const productionScaling = 1 + logFactor * tierMultiplier;
  
  // Combine both multipliers
  const finalCost = helper.baseCost * countMultiplier * productionScaling;
  
  return Math.max(helper.baseCost, Math.floor(finalCost));
};

// Get cost multiplier based on helper tier (position in list)
// Early helpers scale less, late-game helpers scale more
const getHelperTierMultiplier = (helper: PokemonHelper): number => {
  // Find helper index in INITIAL_HELPERS to determine tier
  const index = INITIAL_HELPERS.findIndex(h => h.id === helper.id);
  
  if (index === -1) return 0.2; // Default for unknown helpers
  
  // Tier-based multipliers: early game = less scaling, late game = more scaling
  if (index < 4) return 0.15;      // Tier 1 (starters) - minimal scaling
  if (index < 7) return 0.25;      // Tier 2 - low scaling
  if (index < 10) return 0.35;     // Tier 3 - moderate scaling
  if (index < 13) return 0.45;     // Tier 4 (legendaries) - higher scaling
  return 0.5;                      // Tier 5 (mythicals) - highest scaling
};


export const INITIAL_HELPERS_test: PokemonHelper[] = [
  // Tier 1 - Starter Pokemon with evolutions
  // Pikachu: Premier helper très accessible pour démarrer rapidement
  {
    id: 'pikachu',
    name: 'Pikachu',
    baseCost: 10,
    baseProduction: 0.5,
    count: 0,
    unlocked: true,
    pokemonId: 25,
    evolutions: [
      { level: 25, pokemonId: 26, name: 'Raichu' },
    ],
  },
  // Charmander: Coût modéré, production qui double significativement
  {
    id: 'charmander',
    name: 'Charmander',
    baseCost: 100,
    baseProduction: 5,
    count: 0,
    unlocked: false,
    pokemonId: 4,
    evolutions: [
      { level: 15, pokemonId: 5, name: 'Charmeleon' },
      { level: 35, pokemonId: 6, name: 'Charizard' },
    ],
  },
  // Squirtle: Progression équilibrée
  {
    id: 'squirtle',
    name: 'Squirtle',
    baseCost: 1100,
    baseProduction: 50,
    count: 0,
    unlocked: false,
    pokemonId: 7,
    evolutions: [
      { level: 15, pokemonId: 8, name: 'Wartortle' },
      { level: 35, pokemonId: 9, name: 'Blastoise' },
    ],
  },
  // Bulbasaur: Augmentation significative de production
  {
    id: 'bulbasaur',
    name: 'Bulbasaur',
    baseCost: 12000,
    baseProduction: 500,
    count: 0,
    unlocked: false,
    pokemonId: 1,
    evolutions: [
      { level: 15, pokemonId: 2, name: 'Ivysaur' },
      { level: 35, pokemonId: 3, name: 'Venusaur' },
    ],
  },
  // Meowth: Milieu de Tier 1
  {
    id: 'meowth',
    name: 'Meowth',
    baseCost: 130000,
    baseProduction: 5000,
    count: 0,
    unlocked: false,
    pokemonId: 52,
    evolutions: [
      { level: 28, pokemonId: 53, name: 'Persian' },
    ],
  },
  // Machop: Fin Tier 1
  {
    id: 'machop',
    name: 'Machop',
    baseCost: 1400000,
    baseProduction: 50000,
    count: 0,
    unlocked: false,
    pokemonId: 66,
    evolutions: [
      { level: 28, pokemonId: 67, name: 'Machoke' },
      { level: 40, pokemonId: 68, name: 'Machamp' },
    ],
  },
  // Abra: Transition vers Tier 2
  {
    id: 'abra',
    name: 'Abra',
    baseCost: 20000000,
    baseProduction: 700000,
    count: 0,
    unlocked: false,
    pokemonId: 63,
    evolutions: [
      { level: 16, pokemonId: 64, name: 'Kadabra' },
      { level: 35, pokemonId: 65, name: 'Alakazam' },
    ],
  },
  // Tier 2 - Popular Pokemon with evolutions
  {
    id: 'eevee',
    name: 'Eevee',
    baseCost: 330000000,
    baseProduction: 11000000,
    count: 0,
    unlocked: false,
    pokemonId: 133,
    evolutions: [
      { level: 10, pokemonId: 134, name: 'Vaporeon' },
      { level: 25, pokemonId: 135, name: 'Jolteon' },
      { level: 50, pokemonId: 136, name: 'Flareon' },
      { level: 75, pokemonId: 196, name: 'Espeon' },
      { level: 100, pokemonId: 197, name: 'Umbreon' },
    ],
  },
  {
    id: 'gengar',
    name: 'Gastly',
    baseCost: 5100000000,
    baseProduction: 170000000,
    count: 0,
    unlocked: false,
    pokemonId: 92,
    evolutions: [
      { level: 15, pokemonId: 93, name: 'Haunter' },
      { level: 35, pokemonId: 94, name: 'Gengar' },
    ],
  },
  {
    id: 'dragonite',
    name: 'Dratini',
    baseCost: 75000000000,
    baseProduction: 2500000000,
    count: 0,
    unlocked: false,
    pokemonId: 147,
    evolutions: [
      { level: 15, pokemonId: 148, name: 'Dragonair' },
      { level: 35, pokemonId: 149, name: 'Dragonite' },
    ],
  },
  // Tier 3 - Powerful Pokemon with evolutions
  {
    id: 'snorlax',
    name: 'Munchlax',
    baseCost: 1000000000000,
    baseProduction: 33000000000,
    count: 0,
    unlocked: false,
    pokemonId: 446,
    evolutions: [
      { level: 25, pokemonId: 143, name: 'Snorlax' },
    ],
  },
  {
    id: 'tyranitar',
    name: 'Larvitar',
    baseCost: 14000000000000,
    baseProduction: 460000000000,
    count: 0,
    unlocked: false,
    pokemonId: 246,
    evolutions: [
      { level: 15, pokemonId: 247, name: 'Pupitar' },
      { level: 35, pokemonId: 248, name: 'Tyranitar' },
    ],
  },
  {
    id: 'salamence',
    name: 'Bagon',
    baseCost: 170000000000000,
    baseProduction: 5600000000000,
    count: 0,
    unlocked: false,
    pokemonId: 371,
    evolutions: [
      { level: 15, pokemonId: 372, name: 'Shelgon' },
      { level: 35, pokemonId: 373, name: 'Salamence' },
    ],
  },
  // Tier 4 - Legendary Pokemon (no evolutions)
  {
    id: 'mewtwo',
    name: 'Mewtwo',
    baseCost: 2100000000000000,
    baseProduction: 70000000000000,
    count: 0,
    unlocked: false,
    pokemonId: 150,
  },
  {
    id: 'rayquaza',
    name: 'Rayquaza',
    baseCost: 26000000000000000,
    baseProduction: 860000000000000,
    count: 0,
    unlocked: false,
    pokemonId: 384,
  },
  {
    id: 'dialga',
    name: 'Dialga',
    baseCost: 330000000000000000,
    baseProduction: 11000000000000000,
    count: 0,
    unlocked: false,
    pokemonId: 483,
  },
  // Tier 5 - Mythical Pokemon (no evolutions)
  {
    id: 'arceus',
    name: 'Arceus',
    baseCost: 4100000000000000000,
    baseProduction: 136000000000000000,
    count: 0,
    unlocked: false,
    pokemonId: 493,
  },
  {
    id: 'giratina',
    name: 'Giratina',
    baseCost: 51000000000000000000,
    baseProduction: 1700000000000000000,
    count: 0,
    unlocked: false,
    pokemonId: 487,
  },
];

// Helper function to get current evolution state
export const getCurrentEvolution = (helper: PokemonHelper): { pokemonId: number; name: string } => {
  if (!helper.evolutions || helper.evolutions.length === 0) {
    return { pokemonId: helper.pokemonId || 25, name: helper.name };
  }

  // Find the highest evolution the helper qualifies for
  let currentEvolution = { pokemonId: helper.pokemonId || 25, name: helper.name };
  
  for (const evolution of helper.evolutions) {
    if (helper.count >= evolution.level) {
      currentEvolution = { pokemonId: evolution.pokemonId, name: evolution.name };
    }
  }

  return currentEvolution;
};

// Get next evolution info
export const getNextEvolution = (helper: PokemonHelper): { level: number; name: string } | null => {
  if (!helper.evolutions || helper.evolutions.length === 0) {
    return null;
  }

  for (const evolution of helper.evolutions) {
    if (helper.count < evolution.level) {
      return { level: evolution.level, name: evolution.name };
    }
  }

  return null; // Fully evolved
};

export const getRandomHelpers = (helpers: StarterHelper[][]): StarterHelper[] => {
  const randomIndex = Math.floor(Math.random() * helpers.length);
  return helpers[randomIndex];
};


// 4 premier starters
// 5 suivant populars
// 3 suivant powerhouse
// 3 suivant legendary

export const buildInitalHelpersWithScaling = (): PokemonHelper[] => {
  const starters = getRandomHelpers(ALL_STARTERS);       // 4 premiers
  const populars = getRandomHelpers(ALL_POPULARS);       // 5 suivants
  const powerhouse = getRandomHelpers(ALL_POWERHOUSE);   // 3 suivants
  const legendary = getRandomHelpers(ALL_LEGENDARIES);   // 3 suivants

  const helpersArray: StarterHelper[] = [
    ...starters,
    ...populars,
    ...powerhouse,
    ...legendary,
  ];

  return HELPERS_SCALING.map((h, index) => {
    const template = helpersArray[index];
    return template ? { ...h, ...template } : { ...h };
  }) as PokemonHelper[];
};
export const INITIAL_HELPERS: PokemonHelper[] =  INITIAL_HELPERS_test//buildInitalHelpersWithScaling() 

