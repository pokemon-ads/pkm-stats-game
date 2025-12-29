// Utility to get Pokemon item sprite URLs from PokeAPI
// Format: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/{item-name}.png

export const getItemSpriteUrl = (itemName: string): string => {
  // Convert item name to API format (lowercase with hyphens)
  const formattedName = itemName.toLowerCase().replace(/\s+/g, '-');
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${formattedName}.png`;
};

// ============================================
// ITEM CATEGORIES FOR PC BOX DISPLAY
// ============================================
export type ItemCategory = 'balls' | 'medicine' | 'held' | 'evolution' | 'battle' | 'mega' | 'plates' | 'gems';

export const ITEM_CATEGORIES: Record<string, ItemCategory> = {
  // ============================================
  // POKÉ BALLS
  // ============================================
  'poke-ball': 'balls',
  'great-ball': 'balls',
  'ultra-ball': 'balls',
  'master-ball': 'balls',
  'premier-ball': 'balls',
  'cherish-ball': 'balls',
  'luxury-ball': 'balls',
  'safari-ball': 'balls',
  
  // ============================================
  // MEDICINE & CONSUMABLES
  // ============================================
  'fresh-water': 'medicine',
  'moomoo-milk': 'medicine',
  'full-heal': 'medicine',
  'rare-candy': 'medicine',
  'pp-max': 'medicine',
  'pp-up': 'medicine',
  'ether': 'medicine',
  'max-ether': 'medicine',
  'max-elixir': 'medicine',
  'protein': 'medicine',
  'ability-capsule': 'medicine',
  
  // ============================================
  // HELD ITEMS
  // ============================================
  'light-ball': 'held',
  'charcoal': 'held',
  'mystic-water': 'held',
  'miracle-seed': 'held',
  'amulet-coin': 'held',
  'black-belt': 'held',
  'twisted-spoon': 'held',
  'soothe-bell': 'held',
  'spell-tag': 'held',
  'dragon-fang': 'held',
  'leftovers': 'held',
  'black-glasses': 'held',
  'sharp-beak': 'held',
  'life-orb': 'held',
  'metal-coat': 'held',
  'silk-scarf': 'held',
  'reaper-cloth': 'held',
  'quick-claw': 'held',
  'exp-share': 'held',
  'lucky-egg': 'held',
  'oval-charm': 'held',
  'nugget': 'held',
  'wise-glasses': 'held',
  'expert-belt': 'held',
  'magnet': 'held',
  'heat-rock': 'held',
  'damp-rock': 'held',
  'wave-incense': 'held',
  'luck-incense': 'held',
  'chesto-berry': 'held',
  'haban-berry': 'held',
  
  // ============================================
  // EVOLUTION ITEMS
  // ============================================
  'thunder-stone': 'evolution',
  'fire-stone': 'evolution',
  'water-stone': 'evolution',
  'leaf-stone': 'evolution',
  'moon-stone': 'evolution',
  'sun-stone': 'evolution',
  'dusk-stone': 'evolution',
  'dragon-scale': 'evolution',
  'electirizer': 'evolution',
  
  // ============================================
  // PLATES (Arceus type-changing items)
  // ============================================
  'flame-plate': 'plates',
  'splash-plate': 'plates',
  'zap-plate': 'plates',
  'meadow-plate': 'plates',
  'icicle-plate': 'plates',
  'fist-plate': 'plates',
  'toxic-plate': 'plates',
  'earth-plate': 'plates',
  'sky-plate': 'plates',
  'mind-plate': 'plates',
  'insect-plate': 'plates',
  'stone-plate': 'plates',
  'spooky-plate': 'plates',
  'draco-plate': 'plates',
  'dread-plate': 'plates',
  'iron-plate': 'plates',
  'pixie-plate': 'plates',
  'blank-plate': 'plates',
  
  // ============================================
  // GEMS (type-boosting consumables)
  // ============================================
  'normal-gem': 'gems',
  'fire-gem': 'gems',
  'water-gem': 'gems',
  'electric-gem': 'gems',
  'grass-gem': 'gems',
  'ice-gem': 'gems',
  'fighting-gem': 'gems',
  'poison-gem': 'gems',
  'ground-gem': 'gems',
  'flying-gem': 'gems',
  'psychic-gem': 'gems',
  'bug-gem': 'gems',
  'rock-gem': 'gems',
  'ghost-gem': 'gems',
  'dragon-gem': 'gems',
  'dark-gem': 'gems',
  'steel-gem': 'gems',
  'fairy-gem': 'gems',
  
  // ============================================
  // BATTLE ITEMS
  // ============================================
  'power-anklet': 'battle',
  'power-band': 'battle',
  'power-weight': 'battle',
  'muscle-band': 'battle',
  'full-incense': 'battle',
  'hard-stone': 'battle',
  'razor-claw': 'battle',
  'focus-sash': 'battle',
  'eviolite': 'battle',
  
  // ============================================
  // MEGA STONES & LEGENDARY ORBS
  // ============================================
  'mewtwonite-x': 'mega',
  'mewtwonite-y': 'mega',
  'charizardite-x': 'mega',
  'charizardite-y': 'mega',
  'blastoisinite': 'mega',
  'venusaurite': 'mega',
  'alakazite': 'mega',
  'gengarite': 'mega',
  'tyranitarite': 'mega',
  'salamencite': 'mega',
  'jade-orb': 'mega',
  'adamant-orb': 'mega',
  'lustrous-orb': 'mega',
  'griseous-orb': 'mega',
};

// ============================================
// BOOST ITEM MAP - Unique items for each boost
// ============================================
export const BOOST_ITEM_MAP: Record<string, string> = {
  // Click boosts - Power items
  'click_boost_2x': 'power-anklet',
  'click_boost_5x': 'power-band',
  'click_boost_10x': 'power-weight',
  
  // Production boosts - Experience items
  'production_boost_2x': 'exp-share',
  'production_boost_5x': 'lucky-egg',
  'production_boost_10x': 'oval-charm',
  
  // Instant energy - Restore items
  'instant_energy_small': 'ether',
  'instant_energy_medium': 'max-ether',
  'instant_energy_large': 'max-elixir',
  
  // Auto-clicker
  'auto_clicker': 'quick-claw',
};

// Category display info
export const CATEGORY_INFO: Record<ItemCategory, { name: string; color: string; icon: string }> = {
  balls: { name: 'Poké Balls', color: '#ef4444', icon: '🔴' },
  medicine: { name: 'Médecine', color: '#22c55e', icon: '💊' },
  held: { name: 'Objets Tenus', color: '#3b82f6', icon: '📿' },
  evolution: { name: 'Évolution', color: '#a855f7', icon: '✨' },
  battle: { name: 'Combat', color: '#f97316', icon: '⚔️' },
  mega: { name: 'Méga/Légendaire', color: '#fbbf24', icon: '💎' },
  plates: { name: 'Plaques', color: '#8b5cf6', icon: '🔮' },
  gems: { name: 'Joyaux', color: '#ec4899', icon: '💠' },
};
