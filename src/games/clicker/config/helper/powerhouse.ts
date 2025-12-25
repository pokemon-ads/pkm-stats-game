import type { StarterHelper } from "../../types/game";

// 3 powerful Pokémon per generation

export const POWERHOUSE_GEN1: StarterHelper[] = [
  {
    id: 'abra',
    name: 'Abra',
    pokemonId: 63,
    evolutions: [
      { level: 16, pokemonId: 64, name: 'Kadabra' },
      { level: 35, pokemonId: 65, name: 'Alakazam' },
    ],
  },
  {
    id: 'machop',
    name: 'Machop',
    pokemonId: 66,
    evolutions: [
      { level: 28, pokemonId: 67, name: 'Machoke' },
      { level: 40, pokemonId: 68, name: 'Machamp' },
    ],
  },
  {
    id: 'magikarp',
    name: 'Magikarp',
    pokemonId: 129,
    evolutions: [{ level: 20, pokemonId: 130, name: 'Gyarados' }],
  },
];

export const POWERHOUSE_GEN2: StarterHelper[] = [
  {
    id: 'heracross',
    name: 'Heracross',
    pokemonId: 214,
  },
  {
    id: 'skarmory',
    name: 'Skarmory',
    pokemonId: 227,
  },
  {
    id: 'houndour',
    name: 'Houndour',
    pokemonId: 228,
    evolutions: [{ level: 25, pokemonId: 229, name: 'Houndoom' }],
  },
];

export const POWERHOUSE_GEN3: StarterHelper[] = [
  {
    id: 'torchic-power',
    name: 'Torchic',
    pokemonId: 255,
    evolutions: [
      { level: 15, pokemonId: 256, name: 'Combusken' },
      { level: 35, pokemonId: 257, name: 'Blaziken' },
    ],
  },
  {
    id: 'mudkip-power',
    name: 'Mudkip',
    pokemonId: 258,
    evolutions: [
      { level: 15, pokemonId: 259, name: 'Marshtomp' },
      { level: 35, pokemonId: 260, name: 'Swampert' },
    ],
  },
  {
    id: 'aron',
    name: 'Aron',
    pokemonId: 304,
    evolutions: [
      { level: 15, pokemonId: 305, name: 'Lairon' },
      { level: 35, pokemonId: 306, name: 'Aggron' },
    ],
  },
];

export const POWERHOUSE_GEN4: StarterHelper[] = [
  {
    id: 'rhyhorn',
    name: 'Rhyhorn',
    pokemonId: 111,
    evolutions: [
      { level: 25, pokemonId: 112, name: 'Rhydon' },
      { level: 45, pokemonId: 464, name: 'Rhyperior' },
    ],
  },
  {
    id: 'elekid',
    name: 'Elekid',
    pokemonId: 239,
    evolutions: [
      { level: 20, pokemonId: 125, name: 'Electabuzz' },
      { level: 40, pokemonId: 466, name: 'Electivire' },
    ],
  },
  {
    id: 'magby',
    name: 'Magby',
    pokemonId: 240,
    evolutions: [
      { level: 20, pokemonId: 126, name: 'Magmar' },
      { level: 40, pokemonId: 467, name: 'Magmortar' },
    ],
  },
];

export const POWERHOUSE_GEN5: StarterHelper[] = [
  {
    id: 'axew',
    name: 'Axew',
    pokemonId: 610,
    evolutions: [
      { level: 15, pokemonId: 611, name: 'Fraxure' },
      { level: 35, pokemonId: 612, name: 'Haxorus' },
    ],
  },
  {
    id: 'larvesta',
    name: 'Larvesta',
    pokemonId: 636,
    evolutions: [{ level: 35, pokemonId: 637, name: 'Volcarona' }],
  },
  {
    id: 'timburr',
    name: 'Timburr',
    pokemonId: 532,
    evolutions: [
      { level: 15, pokemonId: 533, name: 'Gurdurr' },
      { level: 35, pokemonId: 534, name: 'Conkeldurr' },
    ],
  },
];

export const POWERHOUSE_GEN6: StarterHelper[] = [
  {
    id: 'ralts-power',
    name: 'Ralts',
    pokemonId: 280,
    evolutions: [
      { level: 15, pokemonId: 281, name: 'Kirlia' },
      { level: 35, pokemonId: 282, name: 'Gardevoir' },
    ],
  },
  {
    id: 'charizard-power',
    name: 'Charmander',
    pokemonId: 4,
    evolutions: [
      { level: 15, pokemonId: 5, name: 'Charmeleon' },
      { level: 35, pokemonId: 6, name: 'Charizard' },
    ],
  },
  {
    id: 'garchomp-power',
    name: 'Gible',
    pokemonId: 443,
    evolutions: [
      { level: 15, pokemonId: 444, name: 'Gabite' },
      { level: 35, pokemonId: 445, name: 'Garchomp' },
    ],
  },
];

export const POWERHOUSE_GEN7: StarterHelper[] = [
  {
    id: 'buzzwole',
    name: 'Buzzwole',
    pokemonId: 794,
  },
  {
    id: 'kartana',
    name: 'Kartana',
    pokemonId: 798,
  },
  {
    id: 'nihilego',
    name: 'Nihilego',
    pokemonId: 793,
  },
];

export const POWERHOUSE_GEN8: StarterHelper[] = [
  {
    id: 'kubfu',
    name: 'Kubfu',
    pokemonId: 891,
    evolutions: [{ level: 30, pokemonId: 892, name: 'Urshifu' }],
  },
  {
    id: 'regieleki',
    name: 'Regieleki',
    pokemonId: 894,
  },
  {
    id: 'dreepy-power',
    name: 'Dreepy',
    pokemonId: 885,
    evolutions: [
      { level: 15, pokemonId: 886, name: 'Drakloak' },
      { level: 35, pokemonId: 887, name: 'Dragapult' },
    ],
  },
];

export const POWERHOUSE_GEN9: StarterHelper[] = [
  {
    id: 'chien-pao',
    name: 'Chien-Pao',
    pokemonId: 1002,
  },
  {
    id: 'chi-yu',
    name: 'Chi-Yu',
    pokemonId: 1004,
  },
  {
    id: 'frigibax',
    name: 'Frigibax',
    pokemonId: 996,
    evolutions: [
      { level: 15, pokemonId: 997, name: 'Arctibax' },
      { level: 35, pokemonId: 998, name: 'Baxcalibur' },
    ],
  },
];

export const ALL_POWERHOUSE: Array<StarterHelper[]> = [
  POWERHOUSE_GEN1,
  POWERHOUSE_GEN2,
  POWERHOUSE_GEN3,
  POWERHOUSE_GEN4,
  POWERHOUSE_GEN5,
  POWERHOUSE_GEN6,
  POWERHOUSE_GEN7,
  POWERHOUSE_GEN8,
  POWERHOUSE_GEN9,
];


