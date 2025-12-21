import type { PokemonHelper } from '../types/game';

export const INITIAL_HELPERS: PokemonHelper[] = [
  // Tier 1 - Starter Pokemon with evolutions
  {
    id: 'pikachu',
    name: 'Pikachu',
    baseCost: 15,
    baseProduction: 0.1,
    count: 0,
    unlocked: true,
    pokemonId: 25,
    evolutions: [
      { level: 25, pokemonId: 26, name: 'Raichu' },
    ],
  },
  {
    id: 'charmander',
    name: 'Charmander',
    baseCost: 100,
    baseProduction: 1,
    count: 0,
    unlocked: true,
    pokemonId: 4,
    evolutions: [
      { level: 15, pokemonId: 5, name: 'Charmeleon' },
      { level: 35, pokemonId: 6, name: 'Charizard' },
    ],
  },
  {
    id: 'squirtle',
    name: 'Squirtle',
    baseCost: 1100,
    baseProduction: 8,
    count: 0,
    unlocked: true,
    pokemonId: 7,
    evolutions: [
      { level: 15, pokemonId: 8, name: 'Wartortle' },
      { level: 35, pokemonId: 9, name: 'Blastoise' },
    ],
  },
  {
    id: 'bulbasaur',
    name: 'Bulbasaur',
    baseCost: 12000,
    baseProduction: 47,
    count: 0,
    unlocked: true,
    pokemonId: 1,
    evolutions: [
      { level: 15, pokemonId: 2, name: 'Ivysaur' },
      { level: 35, pokemonId: 3, name: 'Venusaur' },
    ],
  },
  // Tier 2 - Popular Pokemon with evolutions
  {
    id: 'eevee',
    name: 'Eevee',
    baseCost: 130000,
    baseProduction: 260,
    count: 0,
    unlocked: true,
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
    baseCost: 1400000,
    baseProduction: 1400,
    count: 0,
    unlocked: true,
    pokemonId: 92,
    evolutions: [
      { level: 15, pokemonId: 93, name: 'Haunter' },
      { level: 35, pokemonId: 94, name: 'Gengar' },
    ],
  },
  {
    id: 'dragonite',
    name: 'Dratini',
    baseCost: 20000000,
    baseProduction: 7800,
    count: 0,
    unlocked: true,
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
    baseCost: 330000000,
    baseProduction: 44000,
    count: 0,
    unlocked: true,
    pokemonId: 446,
    evolutions: [
      { level: 25, pokemonId: 143, name: 'Snorlax' },
    ],
  },
  {
    id: 'tyranitar',
    name: 'Larvitar',
    baseCost: 5100000000,
    baseProduction: 260000,
    count: 0,
    unlocked: true,
    pokemonId: 246,
    evolutions: [
      { level: 15, pokemonId: 247, name: 'Pupitar' },
      { level: 35, pokemonId: 248, name: 'Tyranitar' },
    ],
  },
  {
    id: 'salamence',
    name: 'Bagon',
    baseCost: 75000000000,
    baseProduction: 1600000,
    count: 0,
    unlocked: true,
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
    baseCost: 1000000000000,
    baseProduction: 10000000,
    count: 0,
    unlocked: true,
    pokemonId: 150,
  },
  {
    id: 'rayquaza',
    name: 'Rayquaza',
    baseCost: 14000000000000,
    baseProduction: 65000000,
    count: 0,
    unlocked: true,
    pokemonId: 384,
  },
  {
    id: 'dialga',
    name: 'Dialga',
    baseCost: 170000000000000,
    baseProduction: 430000000,
    count: 0,
    unlocked: true,
    pokemonId: 483,
  },
  // Tier 5 - Mythical Pokemon (no evolutions)
  {
    id: 'arceus',
    name: 'Arceus',
    baseCost: 2100000000000000,
    baseProduction: 2900000000,
    count: 0,
    unlocked: true,
    pokemonId: 493,
  },
  {
    id: 'giratina',
    name: 'Giratina',
    baseCost: 26000000000000000,
    baseProduction: 21000000000,
    count: 0,
    unlocked: true,
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