import type { StarterHelper } from "../../types/game";

// 3 legendary Pokémon per generation

export const LEGENDARIES_GEN1: StarterHelper[] = [
  { id: 'articuno', name: 'Articuno', pokemonId: 144 },
  { id: 'zapdos', name: 'Zapdos', pokemonId: 145 },
  { id: 'moltres', name: 'Moltres', pokemonId: 146 },
];

export const LEGENDARIES_GEN2: StarterHelper[] = [
  { id: 'raikou', name: 'Raikou', pokemonId: 243 },
  { id: 'entei', name: 'Entei', pokemonId: 244 },
  { id: 'suicune', name: 'Suicune', pokemonId: 245 },
];

export const LEGENDARIES_GEN3: StarterHelper[] = [
  { id: 'regirock', name: 'Regirock', pokemonId: 377 },
  { id: 'regice', name: 'Regice', pokemonId: 378 },
  { id: 'registeel', name: 'Registeel', pokemonId: 379 },
];

export const LEGENDARIES_GEN4: StarterHelper[] = [
  { id: 'dialga-legend', name: 'Dialga', pokemonId: 483 },
  { id: 'palkia', name: 'Palkia', pokemonId: 484 },
  { id: 'giratina-legend', name: 'Giratina', pokemonId: 487 },
];

export const LEGENDARIES_GEN5: StarterHelper[] = [
  { id: 'cobalion', name: 'Cobalion', pokemonId: 638 },
  { id: 'terrakion', name: 'Terrakion', pokemonId: 639 },
  { id: 'virizion', name: 'Virizion', pokemonId: 640 },
];

export const LEGENDARIES_GEN6: StarterHelper[] = [
  { id: 'xerneas', name: 'Xerneas', pokemonId: 716 },
  { id: 'yveltal', name: 'Yveltal', pokemonId: 717 },
  { id: 'zygarde', name: 'Zygarde', pokemonId: 718 },
];

export const LEGENDARIES_GEN7: StarterHelper[] = [
  { id: 'solgaleo', name: 'Solgaleo', pokemonId: 791 },
  { id: 'lunala', name: 'Lunala', pokemonId: 792 },
  { id: 'necrozma', name: 'Necrozma', pokemonId: 800 },
];

export const LEGENDARIES_GEN8: StarterHelper[] = [
  { id: 'zacian-legend', name: 'Zacian', pokemonId: 888 },
  { id: 'zamazenta-legend', name: 'Zamazenta', pokemonId: 889 },
  { id: 'eternatus', name: 'Eternatus', pokemonId: 890 },
];

export const LEGENDARIES_GEN9: StarterHelper[] = [
  { id: 'koraidon', name: 'Koraidon', pokemonId: 1007 },
  { id: 'miraidon', name: 'Miraidon', pokemonId: 1008 },
  { id: 'ting-lu', name: 'Ting-Lu', pokemonId: 1005 },
];

export const ALL_LEGENDARIES: Array<StarterHelper[]> = [
  LEGENDARIES_GEN1,
  LEGENDARIES_GEN2,
  LEGENDARIES_GEN3,
  LEGENDARIES_GEN4,
  LEGENDARIES_GEN5,
  LEGENDARIES_GEN6,
  LEGENDARIES_GEN7,
  LEGENDARIES_GEN8,
  LEGENDARIES_GEN9,
];


