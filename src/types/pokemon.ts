export interface PokemonStats {
  hp: number
  attack: number
  defense: number
  'special-attack': number
  'special-defense': number
  speed: number
}

export interface Pokemon {
  id: number
  name: string
  names?: {
    en: string
    fr: string
  }
  sprites: {
    front_default: string
    front_shiny: string
  }
  cries: {
    latest: string
    legacy: string
  }
  stats: Array<{
    base_stat: number
    stat: {
      name: keyof PokemonStats
    }
  }>
  types: Array<{
    type: {
      name: string
    }
  }>
  species: {
    url: string
  }
  isShiny?: boolean  // Custom flag to track if this Pokemon instance is shiny
}

export interface PokemonSpecies {
  is_legendary: boolean
  is_mythical: boolean
}

export type StatName = keyof PokemonStats

export const STAT_LABELS: Record<StatName, string> = {
  hp: 'HP',
  attack: 'Attaque',
  defense: 'Défense',
  'special-attack': 'Att. Spé',
  'special-defense': 'Déf. Spé',
  speed: 'Vitesse'
}


// Pokémon regions with their Pokédex ranges
export const REGIONS = {
  kanto: { name: 'Kanto', range: [1, 151] },
  johto: { name: 'Johto', range: [152, 251] },
  hoenn: { name: 'Hoenn', range: [252, 386] },
  sinnoh: { name: 'Sinnoh', range: [387, 493] },
  unova: { name: 'Unys', range: [494, 649] },
  kalos: { name: 'Kalos', range: [650, 721] },
  alola: { name: 'Alola', range: [722, 809] },
  galar: { name: 'Galar', range: [810, 905] },
  paldea: { name: 'Paldea', range: [906, 1025] }
}

// Pokémon generations with their Pokédex ranges
export const GENERATIONS = {
  1: { name: 'Génération 1', range: [1, 151] },
  2: { name: 'Génération 2', range: [152, 251] },
  3: { name: 'Génération 3', range: [252, 386] },
  4: { name: 'Génération 4', range: [387, 493] },
  5: { name: 'Génération 5', range: [494, 649] },
  6: { name: 'Génération 6', range: [650, 721] },
  7: { name: 'Génération 7', range: [722, 809] },
  8: { name: 'Génération 8', range: [810, 905] },
  9: { name: 'Génération 9', range: [906, 1025] }
}

// Regional form Pokémon IDs
export const ALOLA_FORM_IDS = [
  19, 20, 26, 27, 28, 37, 38, 50, 51, 52, 53, 74, 75, 76, 88, 89, 103, 105
]

export const GALAR_FORM_IDS = [
  52, 77, 78, 79, 80, 83, 110, 122, 144, 145, 146, 199, 222, 263, 264, 554, 555, 562, 618
]

export const HISUI_FORM_IDS = [
  58, 59, 100, 101, 157, 211, 215, 483, 484, 487, 503, 549, 550, 570, 571, 628, 705, 706, 713, 724
]

export const PALDEA_FORM_IDS = [
  128 // Tauros has 3 Paldea forms
]

// Regional form name mappings
export const REGIONAL_FORMS: Record<string, Record<number, string[]>> = {
  alola: {
    19: ['rattata-alola'],
    20: ['raticate-alola'],
    26: ['raichu-alola'],
    27: ['sandshrew-alola'],
    28: ['sandslash-alola'],
    37: ['vulpix-alola'],
    38: ['ninetales-alola'],
    50: ['diglett-alola'],
    51: ['dugtrio-alola'],
    52: ['meowth-alola'],
    53: ['persian-alola'],
    74: ['geodude-alola'],
    75: ['graveler-alola'],
    76: ['golem-alola'],
    88: ['grimer-alola'],
    89: ['muk-alola'],
    103: ['exeggutor-alola'],
    105: ['marowak-alola']
  },
  galar: {
    52: ['meowth-galar'],
    77: ['ponyta-galar'],
    78: ['rapidash-galar'],
    79: ['slowpoke-galar'],
    80: ['slowbro-galar'],
    83: ['farfetchd-galar'],
    110: ['weezing-galar'],
    122: ['mr-mime-galar'],
    144: ['articuno-galar'],
    145: ['zapdos-galar'],
    146: ['moltres-galar'],
    199: ['slowking-galar'],
    222: ['corsola-galar'],
    263: ['zigzagoon-galar'],
    264: ['linoone-galar'],
    554: ['darumaka-galar'],
    555: ['darmanitan-galar'],
    562: ['yamask-galar'],
    618: ['stunfisk-galar']
  },
  hisui: {
    58: ['growlithe-hisui'],
    59: ['arcanine-hisui'],
    100: ['voltorb-hisui'],
    101: ['electrode-hisui'],
    157: ['typhlosion-hisui'],
    211: ['qwilfish-hisui'],
    215: ['sneasel-hisui'],
    483: ['dialga-origin'],
    484: ['palkia-origin'],
    487: ['giratina-origin'],
    503: ['samurott-hisui'],
    549: ['lilligant-hisui'],
    550: ['basculin-white-striped'],
    570: ['zorua-hisui'],
    571: ['zoroark-hisui'],
    628: ['braviary-hisui'],
    705: ['sliggoo-hisui'],
    706: ['goodra-hisui'],
    713: ['avalugg-hisui'],
    724: ['decidueye-hisui']
  },
  paldea: {
    128: ['tauros-paldea-combat-breed', 'tauros-paldea-blaze-breed', 'tauros-paldea-aqua-breed']
  }
}

export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
]

// Legendary Pokemon IDs (simplified list - main legendaries)
export const LEGENDARY_IDS = [
  144, 145, 146, 150, 151, // Gen 1
  243, 244, 245, 249, 250, 251, // Gen 2
  377, 378, 379, 380, 381, 382, 383, 384, 385, 386, // Gen 3
  480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, // Gen 4
  494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, // Gen 5
  716, 717, 718, 719, 720, 721, // Gen 6
  785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802, 807, 808, 809, // Gen 7
  888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, // Gen 8
  1001, 1002, 1003, 1004, 1007, 1008, 1009, 1010, 1014, 1015, 1016, 1017, 1024, 1025, // Gen 9
  10007, 10245, 10246 // Origin Forms
]

// Mythical Pokemon IDs
export const MYTHICAL_IDS = [
  151, // Mew
  251, // Celebi
  385, 386, // Jirachi, Deoxys
  489, 490, 491, 492, // Phione, Manaphy, Darkrai, Shaymin
  493, // Arceus
  494, 647, 648, 649, // Victini, Keldeo, Meloetta, Genesect
  719, 720, 721, // Diancie, Hoopa, Volcanion
  801, 802, 807, 808, 809, // Magearna, Marshadow, Zeraora, Meltan, Melmetal
  893, // Zarude
  1025 // Pecharunt
]

// Mega Evolution Pokemon (base forms that have megas)
export const MEGA_EVOLUTION_IDS = [
  3, 6, 9, 15, 18, 65, 80, 94, 115, 127, 130, 142, 150, 181, 208, 212, 214, 229, 
  248, 254, 257, 260, 282, 302, 303, 306, 308, 310, 319, 323, 334, 354, 359, 362,
  373, 376, 380, 381, 382, 383, 384, 428, 445, 448, 460, 475, 531, 719
]

// Gigantamax Pokemon IDs
export const GIGANTAMAX_IDS = [
  3, 6, 9, 12, 25, 52, 68, 94, 99, 131, 133, 143, 569, 809, 812, 815, 818, 823, 826, 834, 839, 841, 842, 844, 849, 851, 858, 861, 869, 879, 884, 892
]

// Ultra Beast Pokemon IDs (Gen 7)
export const ULTRA_BEAST_IDS = [
  793, 794, 795, 796, 797, 798, 799, 803, 804, 805, 806
]

// Paradox Pokemon IDs (Gen 9)
// Ancient Paradox (Past forms from Scarlet)
export const PARADOX_ANCIENT_IDS = [
  984, // Great Tusk (Donphan)
  985, // Scream Tail (Jigglypuff)
  986, // Brute Bonnet (Amoonguss)
  987, // Flutter Mane (Misdreavus)
  988, // Slither Wing (Volcarona)
  989, // Sandy Shocks (Magneton)
  1005, // Roaring Moon (Salamence)
  1009, // Walking Wake (Suicune)
  1010  // Gouging Fire (Entei)
]

// Future Paradox (Future forms from Violet)
export const PARADOX_FUTURE_IDS = [
  990, // Iron Treads (Donphan)
  991, // Iron Bundle (Delibird)
  992, // Iron Hands (Hariyama)
  993, // Iron Jugulis (Hydreigon)
  994, // Iron Moth (Volcarona)
  995, // Iron Thorns (Tyranitar)
  1006, // Iron Valiant (Gardevoir/Gallade)
  1014, // Iron Leaves (Virizion)
  1020, // Iron Boulder (Terrakion)
  1021  // Iron Crown (Cobalion)
]

// All Paradox Pokemon IDs
export const PARADOX_IDS = [
  ...PARADOX_ANCIENT_IDS,
  ...PARADOX_FUTURE_IDS
]

// Legends Z-A Mega Evolution Pokemon (base forms)
// Note: Ces Pokémon auront des méga-évolutions dans Pokémon Légendes: Z-A
export const LEGENDS_ZA_MEGA_IDS = [
  3, 6, 9, 65, 94, 115, 127, 130, 142, 150, // Gen 1 megas
  181, 208, 212, 214, 229, 248, // Gen 2 megas
  254, 257, 260, 282, 302, 303, 306, 308, 310, 319, 323, 334, 354, 359, 362, 373, 376, 380, 381, 384, // Gen 3 megas
  428, 445, 448, 460, 475, // Gen 4 megas
  531, // Gen 5 megas
  719 // Gen 6 megas
]

// Gigantamax form mappings (base ID -> gigantamax form name)
export const GIGANTAMAX_FORMS: Record<number, string> = {
  3: 'venusaur-gmax',
  6: 'charizard-gmax',
  9: 'blastoise-gmax',
  12: 'butterfree-gmax',
  25: 'pikachu-gmax',
  52: 'meowth-gmax',
  68: 'machamp-gmax',
  94: 'gengar-gmax',
  99: 'kingler-gmax',
  131: 'lapras-gmax',
  133: 'eevee-gmax',
  143: 'snorlax-gmax',
  569: 'garbodor-gmax',
  809: 'melmetal-gmax',
  812: 'rillaboom-gmax',
  815: 'cinderace-gmax',
  818: 'inteleon-gmax',
  823: 'corviknight-gmax',
  826: 'orbeetle-gmax',
  834: 'drednaw-gmax',
  839: 'coalossal-gmax',
  841: 'flapple-gmax',
  842: 'appletun-gmax',
  844: 'sandaconda-gmax',
  849: 'toxtricity-amped-gmax', // Toxtricity has two forms
  851: 'centiskorch-gmax',
  858: 'hatterene-gmax',
  861: 'grimmsnarl-gmax',
  869: 'alcremie-gmax',
  879: 'copperajah-gmax',
  884: 'duraludon-gmax',
  892: 'urshifu-single-strike-gmax' // Urshifu has two forms
}

// Mega evolution name mappings (base name -> mega name)
// All Pokemon that can mega-evolve, including those for Legends Z-A
export const MEGA_FORMS: Record<number, string[]> = {
  // Gen 1 Megas
  3: ['venusaur-mega'],
  6: ['charizard-mega-x', 'charizard-mega-y'],
  9: ['blastoise-mega'],
  15: ['beedrill-mega'],
  18: ['pidgeot-mega'],
  65: ['alakazam-mega'],
  80: ['slowbro-mega'],
  94: ['gengar-mega'],
  115: ['kangaskhan-mega'],
  127: ['pinsir-mega'],
  130: ['gyarados-mega'],
  142: ['aerodactyl-mega'],
  150: ['mewtwo-mega-x', 'mewtwo-mega-y'],
  
  // Gen 2 Megas
  181: ['ampharos-mega'],
  208: ['steelix-mega'],
  212: ['scizor-mega'],
  214: ['heracross-mega'],
  229: ['houndoom-mega'],
  248: ['tyranitar-mega'],
  
  // Gen 3 Megas
  254: ['sceptile-mega'],
  257: ['blaziken-mega'],
  260: ['swampert-mega'],
  282: ['gardevoir-mega'],
  302: ['sableye-mega'],
  303: ['mawile-mega'],
  306: ['aggron-mega'],
  308: ['medicham-mega'],
  310: ['manectric-mega'],
  319: ['sharpedo-mega'],
  323: ['camerupt-mega'],
  334: ['altaria-mega'],
  354: ['banette-mega'],
  359: ['absol-mega'],
  362: ['glalie-mega'],
  373: ['salamence-mega'],
  376: ['metagross-mega'],
  380: ['latias-mega'],
  381: ['latios-mega'],
  382: ['kyogre-primal'],
  383: ['groudon-primal'],
  384: ['rayquaza-mega'],
  
  // Gen 4 Megas
  428: ['lopunny-mega'],
  445: ['garchomp-mega'],
  448: ['lucario-mega'],
  460: ['abomasnow-mega'],
  475: ['gallade-mega'],
  
  // Gen 5 Megas
  531: ['audino-mega'],
  
  // Gen 6 Megas
  719: ['diancie-mega']
}