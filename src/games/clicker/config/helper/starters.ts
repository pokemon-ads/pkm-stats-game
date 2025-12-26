import type { StarterHelper } from "../../types/game";

// todo fix pokemonId and evolutions, each generation use pikachu clone and 3 other classic starters

export const STARTERS_NAME_GEN1: StarterHelper[] = [
    { id: 'pikachu', name: 'Pikachu', pokemonId: 25 ,evolutions: [{ level: 25, pokemonId: 26, name: 'Raichu' }]},
    { id: 'charmander', name: 'Charmander', pokemonId: 4 ,evolutions: [{ level: 15, pokemonId: 5, name: 'Charmeleon' },{ level: 35, pokemonId: 6, name: 'Charizard' }]},
    { id: 'squirtle', name: 'Squirtle', pokemonId: 7 ,evolutions: [{ level: 15, pokemonId: 8, name: 'Wartortle' },{ level: 35, pokemonId: 9, name: 'Blastoise' }]},
    { id: 'bulbasaur', name: 'Bulbasaur', pokemonId: 1 ,evolutions: [{ level: 15, pokemonId: 2, name: 'Ivysaur' },{ level: 35, pokemonId: 3, name: 'Venusaur' }]},
   ];
  
 export  const STARTERS_NAME_GEN2: StarterHelper[] = [
    { id: 'marill', name: 'Marill', pokemonId: 183 ,evolutions: [{ level: 20, pokemonId: 184, name: 'Azumarill' }]},
    { id: 'chikorita', name: 'Chikorita', pokemonId: 152 ,evolutions: [{ level: 15, pokemonId: 153, name: 'Bayleef' },{ level: 35, pokemonId: 154, name: 'Meganium' }]},
    { id: 'cyndaquil', name: 'Cyndaquil', pokemonId: 155 ,evolutions: [{ level: 15, pokemonId: 156, name: 'Quilava' },{ level: 35, pokemonId: 157, name: 'Typhlosion' }]},
    { id: 'totodile', name: 'Totodile', pokemonId: 158 ,evolutions: [{ level: 15, pokemonId: 159, name: 'Croconaw' },{ level: 35, pokemonId: 160, name: 'Feraligatr' }]},
  ];
  
export const STARTERS_NAME_GEN3: StarterHelper[] = [
    { id: 'plusle', name: 'Plusle', pokemonId: 311 ,evolutions: [{ level: 25, pokemonId: 312, name: 'Minun' }]},
    { id: 'treecko', name: 'Treecko', pokemonId: 252 ,evolutions: [{ level: 15, pokemonId: 253, name: 'Grovyle' },{ level: 35, pokemonId: 254, name: 'Sceptile' }]},
    { id: 'torchic', name: 'Torchic', pokemonId: 255 ,evolutions: [{ level: 15, pokemonId: 256, name: 'Combusken' },{ level: 35, pokemonId: 257, name: 'Blaziken' }]},
    { id: 'mudkip', name: 'Mudkip', pokemonId: 258 ,evolutions: [{ level: 15, pokemonId: 259, name: 'Marshtomp' },{ level: 35, pokemonId: 260, name: 'Swampert' }]},
  ];

  export const STARTERS_NAME_GEN4: StarterHelper[] = [
    // Pikachu clone
    { id: 'pachirisu', name: 'Pachirisu', pokemonId: 417 ,evolutions: []},
    // Classic starters
    { id: 'turtwig', name: 'Turtwig', pokemonId: 387 ,evolutions: [{ level: 15, pokemonId: 388, name: 'Grotle' },{ level: 35, pokemonId: 389, name: 'Torterra' }]},
    { id: 'chimchar', name: 'Chimchar', pokemonId: 390 ,evolutions: [{ level: 15, pokemonId: 391, name: 'Monferno' },{ level: 35, pokemonId: 392, name: 'Infernape' }]},
    { id: 'piplup', name: 'Piplup', pokemonId: 393 ,evolutions: [{ level: 15, pokemonId: 394, name: 'Prinplup' },{ level: 35, pokemonId: 395, name: 'Empoleon' }]},
  ];

  export const STARTERS_NAME_GEN5: StarterHelper[] = [
    // Pikachu clone
    { id: 'emolga', name: 'Emolga', pokemonId: 587 ,evolutions: []},
    // Classic starters
    { id: 'snivy', name: 'Snivy', pokemonId: 495 ,evolutions: [{ level: 15, pokemonId: 496, name: 'Servine' },{ level: 35, pokemonId: 497, name: 'Serperior' }]},
    { id: 'tepig', name: 'Tepig', pokemonId: 498 ,evolutions: [{ level: 15, pokemonId: 499, name: 'Pignite' },{ level: 35, pokemonId: 500, name: 'Emboar' }]},
    { id: 'oshawott', name: 'Oshawott', pokemonId: 501 ,evolutions: [{ level: 15, pokemonId: 502, name: 'Dewott' },{ level: 35, pokemonId: 503, name: 'Samurott' }]},
  ];

  export const STARTERS_NAME_GEN6: StarterHelper[] = [
    // Pikachu clone
    { id: 'dedenne', name: 'Dedenne', pokemonId: 702 ,evolutions: []},
    // Classic starters
    { id: 'chespin', name: 'Chespin', pokemonId: 650 ,evolutions: [{ level: 15, pokemonId: 651, name: 'Quilladin' },{ level: 35, pokemonId: 652, name: 'Chesnaught' }]},
    { id: 'fennekin', name: 'Fennekin', pokemonId: 653 ,evolutions: [{ level: 15, pokemonId: 654, name: 'Braixen' },{ level: 35, pokemonId: 655, name: 'Delphox' }]},
    { id: 'froakie', name: 'Froakie', pokemonId: 656 ,evolutions: [{ level: 15, pokemonId: 657, name: 'Frogadier' },{ level: 35, pokemonId: 658, name: 'Greninja' }]},
  ];

  export const STARTERS_NAME_GEN7: StarterHelper[] = [
    // Pikachu clone
    { id: 'togedemaru', name: 'Togedemaru', pokemonId: 777 ,evolutions: []},
    // Classic starters
    { id: 'rowlet', name: 'Rowlet', pokemonId: 722 ,evolutions: [{ level: 15, pokemonId: 723, name: 'Dartrix' },{ level: 35, pokemonId: 724, name: 'Decidueye' }]},
    { id: 'litten', name: 'Litten', pokemonId: 725 ,evolutions: [{ level: 15, pokemonId: 726, name: 'Torracat' },{ level: 35, pokemonId: 727, name: 'Incineroar' }]},
    { id: 'popplio', name: 'Popplio', pokemonId: 728 ,evolutions: [{ level: 15, pokemonId: 729, name: 'Brionne' },{ level: 35, pokemonId: 730, name: 'Primarina' }]},
  ];

  export const STARTERS_NAME_GEN8: StarterHelper[] = [
    // Pikachu clone
    { id: 'morpeko', name: 'Morpeko', pokemonId: 877 ,evolutions: []},
    // Classic starters
    { id: 'grookey', name: 'Grookey', pokemonId: 810 ,evolutions: [{ level: 15, pokemonId: 811, name: 'Thwackey' },{ level: 35, pokemonId: 812, name: 'Rillaboom' }]},
    { id: 'scorbunny', name: 'Scorbunny', pokemonId: 813 ,evolutions: [{ level: 15, pokemonId: 814, name: 'Raboot' },{ level: 35, pokemonId: 815, name: 'Cinderace' }]},
    { id: 'sobble', name: 'Sobble', pokemonId: 816 ,evolutions: [{ level: 15, pokemonId: 817, name: 'Drizzile' },{ level: 35, pokemonId: 818, name: 'Inteleon' }]},
  ];

  export const STARTERS_NAME_GEN9: StarterHelper[] = [
    // Pikachu clone line
    { id: 'pawmi', name: 'Pawmi', pokemonId: 921 ,evolutions: [{ level: 10, pokemonId: 922, name: 'Pawmo' },{ level: 25, pokemonId: 923, name: 'Pawmot' }]},
    // Classic starters
    { id: 'sprigatito', name: 'Sprigatito', pokemonId: 906 ,evolutions: [{ level: 15, pokemonId: 907, name: 'Floragato' },{ level: 35, pokemonId: 908, name: 'Meowscarada' }]},
    { id: 'fuecoco', name: 'Fuecoco', pokemonId: 909 ,evolutions: [{ level: 15, pokemonId: 910, name: 'Crocalor' },{ level: 35, pokemonId: 911, name: 'Skeledirge' }]},
    { id: 'quaxly', name: 'Quaxly', pokemonId: 912 ,evolutions: [{ level: 15, pokemonId: 913, name: 'Quaxwell' },{ level: 35, pokemonId: 914, name: 'Quaquaval' }]},
  ];


  // pick one when game start
  export const ALL_STARTERS: Array<StarterHelper[]> = [
    STARTERS_NAME_GEN1,
    STARTERS_NAME_GEN2,
    STARTERS_NAME_GEN3,
    STARTERS_NAME_GEN4,
    STARTERS_NAME_GEN5,
    STARTERS_NAME_GEN6,
    STARTERS_NAME_GEN7,
    STARTERS_NAME_GEN8,
    STARTERS_NAME_GEN9,
  ];