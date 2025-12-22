// Utility to get Pokemon item sprite URLs from PokeAPI
// Format: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/{item-name}.png

export const getItemSpriteUrl = (itemName: string): string => {
  // Convert item name to API format (lowercase with hyphens)
  const formattedName = itemName.toLowerCase().replace(/\s+/g, '-');
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${formattedName}.png`;
};

// Mapping of upgrade IDs to Pokemon item names
export const UPGRADE_ITEM_MAP: Record<string, string> = {
  // Click upgrades
  'better_mouse': 'poke-ball',
  'gaming_mouse': 'great-ball',
  'super_mouse': 'ultra-ball',
  'mega_mouse': 'master-ball',
  'ultra_mouse': 'premier-ball',
  'master_mouse': 'cherish-ball',
  'legendary_mouse': 'luxury-ball',
  'mythical_mouse': 'safari-ball',
  
  // Global upgrades
  'energy_drink': 'fresh-water',
  'coffee_break': 'moomoo-milk',
  'pokemon_center': 'full-heal',
  'power_plant': 'thunder-stone',
  'pokemon_league': 'rare-candy',
  'elite_four': 'max-revive',
  'champion': 'master-ball',
  'pokemon_master': 'rare-candy',
  
  // Helper upgrades - Stones
  'pikachu_t2': 'thunder-stone',
  'charmander_t2': 'fire-stone',
  'squirtle_t2': 'water-stone',
  'bulbasaur_t2': 'leaf-stone',
  'eevee_t2': 'moon-stone',
  'dragonite_t2': 'dragon-scale',
  'tyranitar_t2': 'dusk-stone',
  'salamence_t2': 'dragon-fang',
  'mewtwo_t2': 'mewtwonite-x',
  'rayquaza_t2': 'jade-orb',
  'dialga_t2': 'adamant-orb',
  'arceus_t2': 'flame-plate',
  'giratina_t2': 'griseous-orb',
  
  // Helper upgrades - Training (use various items)
  'pikachu_t1': 'light-ball',
  'charmander_t1': 'charcoal',
  'squirtle_t1': 'mystic-water',
  'bulbasaur_t1': 'miracle-seed',
  'eevee_t1': 'soothe-bell',
  'gengar_t1': 'spell-tag',
  'gengar_t2': 'spell-tag',
  'dragonite_t1': 'dragon-scale',
  'snorlax_t1': 'leftovers',
  'snorlax_t2': 'leftovers',
  'tyranitar_t1': 'black-glasses',
  'salamence_t1': 'dragon-fang',
  'mewtwo_t1': 'twisted-spoon',
  'rayquaza_t1': 'sharp-beak',
  'dialga_t1': 'metal-coat',
  'arceus_t1': 'silk-scarf',
  'giratina_t1': 'spell-tag',
  'meowth_t1': 'amulet-coin',
  'meowth_t2': 'nugget',
  'machop_t1': 'black-belt',
  'machop_t2': 'muscle-band',
  'abra_t1': 'twisted-spoon',
  'abra_t2': 'wise-glasses',
  
  // Evolution upgrades
  'raichu_power': 'thunder-stone',
  'charmeleon_fury': 'fire-stone',
  'charizard_blaze': 'fire-stone',
  'wartortle_shell': 'water-stone',
  'blastoise_hydro': 'water-stone',
  'ivysaur_growth': 'leaf-stone',
  'venusaur_solar': 'leaf-stone',
  'vaporeon_aqua': 'water-stone',
  'jolteon_thunder': 'thunder-stone',
  'flareon_flare': 'fire-stone',
  'espeon_psychic': 'sun-stone',
  'umbreon_dark': 'moon-stone',
  'haunter_curse': 'dusk-stone',
  'gengar_shadow': 'dusk-stone',
  'dragonair_grace': 'dragon-scale',
  'dragonite_outrage': 'dragon-scale',
  'snorlax_rest': 'leftovers',
  'pupitar_harden': 'dusk-stone',
  'tyranitar_crunch': 'dusk-stone',
  'shelgon_protect': 'dragon-fang',
  'salamence_fly': 'dragon-fang',
  'persian_payday': 'amulet-coin',
  'machoke_strength': 'black-belt',
  'machamp_might': 'muscle-band',
  'kadabra_psychic': 'twisted-spoon',
  'alakazam_mind': 'wise-glasses',
};

// Mapping of boost IDs to Pokemon item names
export const BOOST_ITEM_MAP: Record<string, string> = {
  // Click boosts
  'click_boost_2x': 'zap-plate',
  'click_boost_5x': 'magnet',
  'click_boost_10x': 'light-ball',
  
  // Production boosts
  'production_boost_2x': 'exp-share',
  'production_boost_5x': 'lucky-egg',
  'production_boost_10x': 'amulet-coin',
  
  // Instant energy
  'instant_energy_small': 'rare-candy',
  'instant_energy_medium': 'max-revive',
  'instant_energy_large': 'master-ball',
  
  // Auto-clicker
  'auto_clicker': 'quick-claw',
};

