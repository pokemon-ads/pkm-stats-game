import type { StarterHelper } from "../../types/game";

// 5 popular Pokémon per generation

export const POPULARS_GEN1: StarterHelper[] = [
  {
    id: 'eevee',
    name: 'Eevee',
    pokemonId: 133,
    evolutions: [
      { level: 10, pokemonId: 134, name: 'Vaporeon' },
      { level: 25, pokemonId: 135, name: 'Jolteon' },
      { level: 40, pokemonId: 136, name: 'Flareon' },
      { level: 60, pokemonId: 196, name: 'Espeon' },
      { level: 80, pokemonId: 197, name: 'Umbreon' },
    ],
  },
  {
    id: 'gastly',
    name: 'Gastly',
    pokemonId: 92,
    evolutions: [
      { level: 15, pokemonId: 93, name: 'Haunter' },
      { level: 35, pokemonId: 94, name: 'Gengar' },
    ],
  },
  {
    id: 'dratini',
    name: 'Dratini',
    pokemonId: 147,
    evolutions: [
      { level: 15, pokemonId: 148, name: 'Dragonair' },
      { level: 35, pokemonId: 149, name: 'Dragonite' },
    ],
  },
  {
    id: 'munchlax',
    name: 'Munchlax',
    pokemonId: 446,
    evolutions: [{ level: 25, pokemonId: 143, name: 'Snorlax' }],
  },
  {
    id: 'mewtwo',
    name: 'Mewtwo',
    pokemonId: 150,
  },
];

export const POPULARS_GEN2: StarterHelper[] = [
  {
    id: 'mareep',
    name: 'Mareep',
    pokemonId: 179,
    evolutions: [
      { level: 15, pokemonId: 180, name: 'Flaaffy' },
      { level: 35, pokemonId: 181, name: 'Ampharos' },
    ],
  },
  {
    id: 'scyther',
    name: 'Scyther',
    pokemonId: 123,
    evolutions: [{ level: 30, pokemonId: 212, name: 'Scizor' }],
  },
  {
    id: 'larvitar',
    name: 'Larvitar',
    pokemonId: 246,
    evolutions: [
      { level: 15, pokemonId: 247, name: 'Pupitar' },
      { level: 35, pokemonId: 248, name: 'Tyranitar' },
    ],
  },
  {
    id: 'eevee-umbreon',
    name: 'Eevee',
    pokemonId: 133,
    evolutions: [{ level: 30, pokemonId: 197, name: 'Umbreon' }],
  },
  {
    id: 'eevee-espeon',
    name: 'Eevee',
    pokemonId: 133,
    evolutions: [{ level: 30, pokemonId: 196, name: 'Espeon' }],
  },
];

export const POPULARS_GEN3: StarterHelper[] = [
  {
    id: 'ralts',
    name: 'Ralts',
    pokemonId: 280,
    evolutions: [
      { level: 15, pokemonId: 281, name: 'Kirlia' },
      { level: 35, pokemonId: 282, name: 'Gardevoir' },
    ],
  },
  {
    id: 'trapinch',
    name: 'Trapinch',
    pokemonId: 328,
    evolutions: [
      { level: 15, pokemonId: 329, name: 'Vibrava' },
      { level: 35, pokemonId: 330, name: 'Flygon' },
    ],
  },
  {
    id: 'beldum',
    name: 'Beldum',
    pokemonId: 374,
    evolutions: [
      { level: 15, pokemonId: 375, name: 'Metang' },
      { level: 35, pokemonId: 376, name: 'Metagross' },
    ],
  },
  {
    id: 'feebas',
    name: 'Feebas',
    pokemonId: 349,
    evolutions: [{ level: 25, pokemonId: 350, name: 'Milotic' }],
  },
  {
    id: 'bagon',
    name: 'Bagon',
    pokemonId: 371,
    evolutions: [
      { level: 15, pokemonId: 372, name: 'Shelgon' },
      { level: 35, pokemonId: 373, name: 'Salamence' },
    ],
  },
];

export const POPULARS_GEN4: StarterHelper[] = [
  {
    id: 'riolu',
    name: 'Riolu',
    pokemonId: 447,
    evolutions: [{ level: 25, pokemonId: 448, name: 'Lucario' }],
  },
  {
    id: 'gible',
    name: 'Gible',
    pokemonId: 443,
    evolutions: [
      { level: 15, pokemonId: 444, name: 'Gabite' },
      { level: 35, pokemonId: 445, name: 'Garchomp' },
    ],
  },
  {
    id: 'shinx',
    name: 'Shinx',
    pokemonId: 403,
    evolutions: [
      { level: 15, pokemonId: 404, name: 'Luxio' },
      { level: 35, pokemonId: 405, name: 'Luxray' },
    ],
  },
  {
    id: 'togetic',
    name: 'Togetic',
    pokemonId: 176,
    evolutions: [{ level: 30, pokemonId: 468, name: 'Togekiss' }],
  },
  {
    id: 'magneton',
    name: 'Magneton',
    pokemonId: 82,
    evolutions: [{ level: 30, pokemonId: 462, name: 'Magnezone' }],
  },
];

export const POPULARS_GEN5: StarterHelper[] = [
  {
    id: 'deino',
    name: 'Deino',
    pokemonId: 633,
    evolutions: [
      { level: 15, pokemonId: 634, name: 'Zweilous' },
      { level: 35, pokemonId: 635, name: 'Hydreigon' },
    ],
  },
  {
    id: 'drilbur',
    name: 'Drilbur',
    pokemonId: 529,
    evolutions: [{ level: 25, pokemonId: 530, name: 'Excadrill' }],
  },
  {
    id: 'sandile',
    name: 'Sandile',
    pokemonId: 551,
    evolutions: [
      { level: 15, pokemonId: 552, name: 'Krokorok' },
      { level: 35, pokemonId: 553, name: 'Krookodile' },
    ],
  },
  {
    id: 'pawniard',
    name: 'Pawniard',
    pokemonId: 624,
    evolutions: [{ level: 30, pokemonId: 625, name: 'Bisharp' }],
  },
  {
    id: 'litwick',
    name: 'Litwick',
    pokemonId: 607,
    evolutions: [
      { level: 15, pokemonId: 608, name: 'Lampent' },
      { level: 35, pokemonId: 609, name: 'Chandelure' },
    ],
  },
];

export const POPULARS_GEN6: StarterHelper[] = [
  {
    id: 'froakie-popular',
    name: 'Froakie',
    pokemonId: 656,
    evolutions: [
      { level: 15, pokemonId: 657, name: 'Frogadier' },
      { level: 35, pokemonId: 658, name: 'Greninja' },
    ],
  },
  {
    id: 'fletchling',
    name: 'Fletchling',
    pokemonId: 661,
    evolutions: [
      { level: 15, pokemonId: 662, name: 'Fletchinder' },
      { level: 35, pokemonId: 663, name: 'Talonflame' },
    ],
  },
  {
    id: 'eevee-sylveon',
    name: 'Eevee',
    pokemonId: 133,
    evolutions: [{ level: 35, pokemonId: 700, name: 'Sylveon' }],
  },
  {
    id: 'honedge',
    name: 'Honedge',
    pokemonId: 679,
    evolutions: [
      { level: 15, pokemonId: 680, name: 'Doublade' },
      { level: 35, pokemonId: 681, name: 'Aegislash' },
    ],
  },
  {
    id: 'goomy',
    name: 'Goomy',
    pokemonId: 704,
    evolutions: [
      { level: 15, pokemonId: 705, name: 'Sliggoo' },
      { level: 35, pokemonId: 706, name: 'Goodra' },
    ],
  },
];

export const POPULARS_GEN7: StarterHelper[] = [
  {
    id: 'mimikyu',
    name: 'Mimikyu',
    pokemonId: 778,
  },
  {
    id: 'rockruff',
    name: 'Rockruff',
    pokemonId: 744,
    evolutions: [{ level: 25, pokemonId: 745, name: 'Lycanroc' }],
  },
  {
    id: 'litten-popular',
    name: 'Litten',
    pokemonId: 725,
    evolutions: [
      { level: 15, pokemonId: 726, name: 'Torracat' },
      { level: 35, pokemonId: 727, name: 'Incineroar' },
    ],
  },
  {
    id: 'rowlet-popular',
    name: 'Rowlet',
    pokemonId: 722,
    evolutions: [
      { level: 15, pokemonId: 723, name: 'Dartrix' },
      { level: 35, pokemonId: 724, name: 'Decidueye' },
    ],
  },
  {
    id: 'popplio-popular',
    name: 'Popplio',
    pokemonId: 728,
    evolutions: [
      { level: 15, pokemonId: 729, name: 'Brionne' },
      { level: 35, pokemonId: 730, name: 'Primarina' },
    ],
  },
];

export const POPULARS_GEN8: StarterHelper[] = [
  {
    id: 'rookidee',
    name: 'Rookidee',
    pokemonId: 821,
    evolutions: [
      { level: 15, pokemonId: 822, name: 'Corvisquire' },
      { level: 35, pokemonId: 823, name: 'Corviknight' },
    ],
  },
  {
    id: 'toxtricity',
    name: 'Toxel',
    pokemonId: 848,
    evolutions: [{ level: 30, pokemonId: 849, name: 'Toxtricity' }],
  },
  {
    id: 'dreepy',
    name: 'Dreepy',
    pokemonId: 885,
    evolutions: [
      { level: 15, pokemonId: 886, name: 'Drakloak' },
      { level: 35, pokemonId: 887, name: 'Dragapult' },
    ],
  },
  {
    id: 'farfetchd-galar',
    name: "Galarian Farfetch'd",
    pokemonId: 865,
    evolutions: [{ level: 30, pokemonId: 865, name: "Sirfetch'd" }],
  },
  {
    id: 'grookey-popular',
    name: 'Grookey',
    pokemonId: 810,
    evolutions: [
      { level: 15, pokemonId: 811, name: 'Thwackey' },
      { level: 35, pokemonId: 812, name: 'Rillaboom' },
    ],
  },
];

export const POPULARS_GEN9: StarterHelper[] = [
  {
    id: 'pawniard-kingambit',
    name: 'Pawniard',
    pokemonId: 624,
    evolutions: [
      { level: 20, pokemonId: 625, name: 'Bisharp' },
      { level: 40, pokemonId: 983, name: 'Kingambit' },
    ],
  },
  {
    id: 'mankey-annihilape',
    name: 'Mankey',
    pokemonId: 56,
    evolutions: [
      { level: 15, pokemonId: 57, name: 'Primeape' },
      { level: 35, pokemonId: 979, name: 'Annihilape' },
    ],
  },
  {
    id: 'charcadet-armarouge',
    name: 'Charcadet',
    pokemonId: 935,
    evolutions: [{ level: 30, pokemonId: 936, name: 'Armarouge' }],
  },
  {
    id: 'charcadet-ceruledge',
    name: 'Charcadet',
    pokemonId: 935,
    evolutions: [{ level: 30, pokemonId: 937, name: 'Ceruledge' }],
  },
  {
    id: 'nacli',
    name: 'Nacli',
    pokemonId: 932,
    evolutions: [
      { level: 15, pokemonId: 933, name: 'Naclstack' },
      { level: 35, pokemonId: 934, name: 'Garganacl' },
    ],
  },
];

export const ALL_POPULARS: Array<StarterHelper[]> = [
  POPULARS_GEN1,
  POPULARS_GEN2,
  POPULARS_GEN3,
  POPULARS_GEN4,
  POPULARS_GEN5,
  POPULARS_GEN6,
  POPULARS_GEN7,
  POPULARS_GEN8,
  POPULARS_GEN9,
];