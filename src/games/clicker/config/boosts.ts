import type { Boost } from '../types/game';
import { getItemSpriteUrl, BOOST_ITEM_MAP } from '../utils/itemSprites';

// Calculate dynamic boost cost based on current production
// Formula: baseCost * (1 + log(1 + energyPerSecond / baseProduction) * costMultiplier)
// Logarithmic scaling provides smooth, balanced progression that doesn't explode
export const calculateBoostCost = (boost: Boost, energyPerSecond: number): number => {
  // Base production threshold - costs scale from this point
  const baseProduction = 50;
  
  // Use logarithmic scaling for smooth, balanced progression
  // log(1 + x) ensures we start at 0 when production is 0
  // The +1 prevents log(0) and creates a smooth curve
  const productionRatio = Math.max(0, energyPerSecond / baseProduction);
  const logFactor = Math.log1p(productionRatio); // log1p(x) = log(1 + x), more accurate for small values
  const scalingFactor = 1 + logFactor * boost.costMultiplier;
  
  // Ensure minimum cost is baseCost
  return Math.max(boost.baseCost, Math.floor(boost.baseCost * scalingFactor));
};

export const AVAILABLE_BOOSTS: Boost[] = [
  // Click Power Boosts
  {
    id: 'click_boost_2x',
    name: 'Power Click x2',
    description: 'Double la puissance de chaque clic',
    baseCost: 5000,
    costMultiplier: 0.3, // Gentle scaling with logarithmic curve
    type: 'CLICK_MULTIPLIER',
    value: 2,
    duration: 30, // 30 seconds
    cooldown: 300, // 5 minutes
    icon: getItemSpriteUrl(BOOST_ITEM_MAP['click_boost_2x']),
  },
  {
    id: 'click_boost_5x',
    name: 'Power Click x5',
    description: 'Quintuple la puissance de chaque clic',
    baseCost: 25000,
    costMultiplier: 0.4, // Moderate scaling
    type: 'CLICK_MULTIPLIER',
    value: 5,
    duration: 60, // 1 minute
    cooldown: 600, // 10 minutes
    icon: getItemSpriteUrl(BOOST_ITEM_MAP['click_boost_5x']),
  },
  {
    id: 'click_boost_10x',
    name: 'Power Click x10',
    description: 'Décuple la puissance de chaque clic',
    baseCost: 100000,
    costMultiplier: 0.5, // Higher but still balanced scaling
    type: 'CLICK_MULTIPLIER',
    value: 10,
    duration: 120, // 2 minutes
    cooldown: 1800, // 30 minutes
    icon: getItemSpriteUrl(BOOST_ITEM_MAP['click_boost_10x']),
  },
  
  // Production Boosts
  {
    id: 'production_boost_2x',
    name: 'Production Boost x2',
    description: 'Double la production de tous les Pokémon',
    baseCost: 10000,
    costMultiplier: 0.35, // Balanced scaling
    type: 'PRODUCTION_MULTIPLIER',
    value: 2,
    duration: 30, // 30 seconds
    cooldown: 300, // 5 minutes
    icon: getItemSpriteUrl(BOOST_ITEM_MAP['production_boost_2x']),
  },
  {
    id: 'production_boost_5x',
    name: 'Production Boost x5',
    description: 'Quintuple la production de tous les Pokémon',
    baseCost: 50000,
    costMultiplier: 0.45, // Moderate scaling
    type: 'PRODUCTION_MULTIPLIER',
    value: 5,
    duration: 60, // 1 minute
    cooldown: 600, // 10 minutes
    icon: getItemSpriteUrl(BOOST_ITEM_MAP['production_boost_5x']),
  },
  {
    id: 'production_boost_10x',
    name: 'Production Boost x10',
    description: 'Décuple la production de tous les Pokémon',
    baseCost: 200000,
    costMultiplier: 0.55, // Higher but controlled scaling
    type: 'PRODUCTION_MULTIPLIER',
    value: 10,
    duration: 120, // 2 minutes
    cooldown: 1800, // 30 minutes
    icon: getItemSpriteUrl(BOOST_ITEM_MAP['production_boost_10x']),
  },
  
  // Instant Energy
  {
    id: 'instant_energy_small',
    name: 'Énergie Instantanée',
    description: 'Gagne 10% de ton énergie totale instantanément',
    baseCost: 15000,
    costMultiplier: 0.25, // Lower scaling since it's based on totalEnergy
    type: 'INSTANT_ENERGY',
    value: 0.1, // 10% of totalEnergy
    duration: 0, // Instant
    cooldown: 300, // 5 minutes
    icon: getItemSpriteUrl(BOOST_ITEM_MAP['instant_energy_small']),
  },
  {
    id: 'instant_energy_medium',
    name: 'Énergie Instantanée+',
    description: 'Gagne 25% de ton énergie totale instantanément',
    baseCost: 50000,
    costMultiplier: 0.3, // Gentle scaling
    type: 'INSTANT_ENERGY',
    value: 0.25, // 25% of totalEnergy
    duration: 0, // Instant
    cooldown: 600, // 10 minutes
    icon: getItemSpriteUrl(BOOST_ITEM_MAP['instant_energy_medium']),
  },
  {
    id: 'instant_energy_large',
    name: 'Énergie Instantanée++',
    description: 'Gagne 50% de ton énergie totale instantanément',
    baseCost: 150000,
    costMultiplier: 0.35, // Moderate scaling
    type: 'INSTANT_ENERGY',
    value: 0.5, // 50% of totalEnergy
    duration: 0, // Instant
    cooldown: 1800, // 30 minutes
    icon: getItemSpriteUrl(BOOST_ITEM_MAP['instant_energy_large']),
  },
  
  // Auto-Clicker
  {
    id: 'auto_clicker',
    name: 'Auto-Clicker',
    description: 'Clique automatiquement 5 fois par seconde',
    baseCost: 30000,
    costMultiplier: 0.4, // Balanced scaling
    type: 'AUTO_CLICKER',
    value: 5, // Clicks per second
    duration: 60, // 1 minute
    cooldown: 900, // 15 minutes
    icon: getItemSpriteUrl(BOOST_ITEM_MAP['auto_clicker']),
  },
];

