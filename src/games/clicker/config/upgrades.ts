
import type { Upgrade } from '../types/game';

export const INITIAL_UPGRADES: Upgrade[] = [
  // CLICK UPGRADES
  { id: 'better_mouse', name: 'Better Mouse', description: 'Click x2', cost: 100, type: 'CLICK_MULTIPLIER', value: 2, purchased: false, icon: '🖱️', category: 'click', condition: { type: 'TOTAL_ENERGY', amount: 50 } },
  { id: 'gaming_mouse', name: 'Gaming Mouse', description: 'Click x3', cost: 1000, type: 'CLICK_MULTIPLIER', value: 3, purchased: false, icon: '🎮', category: 'click', condition: { type: 'TOTAL_ENERGY', amount: 500 } },
  { id: 'super_mouse', name: 'Super Mouse', description: 'Click x5', cost: 10000, type: 'CLICK_MULTIPLIER', value: 5, purchased: false, icon: '⚡', category: 'click', condition: { type: 'TOTAL_ENERGY', amount: 5000 } },
  { id: 'mega_mouse', name: 'Mega Mouse', description: 'Click x10', cost: 100000, type: 'CLICK_MULTIPLIER', value: 10, purchased: false, icon: '💎', category: 'click', condition: { type: 'TOTAL_ENERGY', amount: 50000 } },
  { id: 'ultra_mouse', name: 'Ultra Mouse', description: 'Click x25', cost: 1000000, type: 'CLICK_MULTIPLIER', value: 25, purchased: false, icon: '🌟', category: 'click', condition: { type: 'TOTAL_ENERGY', amount: 500000 } },
  { id: 'master_mouse', name: 'Master Mouse', description: 'Click x100', cost: 50000000, type: 'CLICK_MULTIPLIER', value: 100, purchased: false, icon: '👑', category: 'click', condition: { type: 'TOTAL_ENERGY', amount: 25000000 } },

  // GLOBAL UPGRADES
  { id: 'energy_drink', name: 'Energy Drink', description: 'All +10%', cost: 500, type: 'GLOBAL_MULTIPLIER', value: 1.1, purchased: false, icon: '🥤', category: 'global', condition: { type: 'TOTAL_ENERGY', amount: 250 } },
  { id: 'coffee_break', name: 'Coffee Break', description: 'All +25%', cost: 5000, type: 'GLOBAL_MULTIPLIER', value: 1.25, purchased: false, icon: '☕', category: 'global', condition: { type: 'TOTAL_ENERGY', amount: 2500 } },
  { id: 'pokemon_center', name: 'Pokémon Center', description: 'All +50%', cost: 50000, type: 'GLOBAL_MULTIPLIER', value: 1.5, purchased: false, icon: '🏥', category: 'global', condition: { type: 'TOTAL_ENERGY', amount: 25000 } },
  { id: 'power_plant', name: 'Power Plant', description: 'All x2', cost: 500000, type: 'GLOBAL_MULTIPLIER', value: 2, purchased: false, icon: '⚡', category: 'global', condition: { type: 'TOTAL_ENERGY', amount: 250000 } },
  { id: 'pokemon_league', name: 'Pokémon League', description: 'All x3', cost: 5000000, type: 'GLOBAL_MULTIPLIER', value: 3, purchased: false, icon: '🏆', category: 'global', condition: { type: 'TOTAL_ENERGY', amount: 2500000 } },
  { id: 'elite_four', name: 'Elite Four', description: 'All x5', cost: 100000000, type: 'GLOBAL_MULTIPLIER', value: 5, purchased: false, icon: '🎖️', category: 'global', condition: { type: 'TOTAL_ENERGY', amount: 50000000 } },
  { id: 'champion', name: 'Champion', description: 'All x10', cost: 10000000000, type: 'GLOBAL_MULTIPLIER', value: 10, purchased: false, icon: '👑', category: 'global', condition: { type: 'TOTAL_ENERGY', amount: 5000000000 } },

  // HELPER UPGRADES - Pikachu
  { id: 'pikachu_t1', name: 'Pikachu Training', description: 'Pikachu x2', cost: 1000, type: 'HELPER_MULTIPLIER', targetId: 'pikachu', value: 2, purchased: false, icon: '⚡', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'pikachu', amount: 10 } },
  { id: 'pikachu_t2', name: 'Thunder Stone', description: 'Pikachu x5', cost: 10000, type: 'HELPER_MULTIPLIER', targetId: 'pikachu', value: 5, purchased: false, icon: '💎', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'pikachu', amount: 25 } },

  // HELPER UPGRADES - Charmander
  { id: 'charmander_t1', name: 'Charmander Training', description: 'Charmander x2', cost: 5000, type: 'HELPER_MULTIPLIER', targetId: 'charmander', value: 2, purchased: false, icon: '🔥', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'charmander', amount: 10 } },
  { id: 'charmander_t2', name: 'Fire Stone', description: 'Charmander x5', cost: 50000, type: 'HELPER_MULTIPLIER', targetId: 'charmander', value: 5, purchased: false, icon: '💎', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'charmander', amount: 25 } },

  // HELPER UPGRADES - Squirtle
  { id: 'squirtle_t1', name: 'Squirtle Training', description: 'Squirtle x2', cost: 25000, type: 'HELPER_MULTIPLIER', targetId: 'squirtle', value: 2, purchased: false, icon: '💧', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'squirtle', amount: 10 } },
  { id: 'squirtle_t2', name: 'Water Stone', description: 'Squirtle x5', cost: 250000, type: 'HELPER_MULTIPLIER', targetId: 'squirtle', value: 5, purchased: false, icon: '💎', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'squirtle', amount: 25 } },

  // HELPER UPGRADES - Bulbasaur
  { id: 'bulbasaur_t1', name: 'Bulbasaur Training', description: 'Bulbasaur x2', cost: 150000, type: 'HELPER_MULTIPLIER', targetId: 'bulbasaur', value: 2, purchased: false, icon: '🌿', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'bulbasaur', amount: 10 } },
  { id: 'bulbasaur_t2', name: 'Leaf Stone', description: 'Bulbasaur x5', cost: 1500000, type: 'HELPER_MULTIPLIER', targetId: 'bulbasaur', value: 5, purchased: false, icon: '💎', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'bulbasaur', amount: 25 } },

  // HELPER UPGRADES - Eevee
  { id: 'eevee_t1', name: 'Eevee Training', description: 'Eevee x2', cost: 1000000, type: 'HELPER_MULTIPLIER', targetId: 'eevee', value: 2, purchased: false, icon: '🦊', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'eevee', amount: 10 } },
  { id: 'eevee_t2', name: 'Evolution Stone', description: 'Eevee x5', cost: 10000000, type: 'HELPER_MULTIPLIER', targetId: 'eevee', value: 5, purchased: false, icon: '💎', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'eevee', amount: 25 } },

  // HELPER UPGRADES - Gengar
  { id: 'gengar_t1', name: 'Gengar Training', description: 'Gengar x2', cost: 10000000, type: 'HELPER_MULTIPLIER', targetId: 'gengar', value: 2, purchased: false, icon: '👻', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'gengar', amount: 10 } },
  { id: 'gengar_t2', name: 'Spell Tag', description: 'Gengar x5', cost: 100000000, type: 'HELPER_MULTIPLIER', targetId: 'gengar', value: 5, purchased: false, icon: '🏷️', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'gengar', amount: 25 } },

  // HELPER UPGRADES - Dragonite
  { id: 'dragonite_t1', name: 'Dragonite Training', description: 'Dragonite x2', cost: 100000000, type: 'HELPER_MULTIPLIER', targetId: 'dragonite', value: 2, purchased: false, icon: '🐉', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'dragonite', amount: 10 } },
  { id: 'dragonite_t2', name: 'Dragon Scale', description: 'Dragonite x5', cost: 1000000000, type: 'HELPER_MULTIPLIER', targetId: 'dragonite', value: 5, purchased: false, icon: '💎', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'dragonite', amount: 25 } },

  // HELPER UPGRADES - Snorlax
  { id: 'snorlax_t1', name: 'Snorlax Training', description: 'Snorlax x2', cost: 2000000000, type: 'HELPER_MULTIPLIER', targetId: 'snorlax', value: 2, purchased: false, icon: '😴', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'snorlax', amount: 10 } },
  { id: 'snorlax_t2', name: 'Leftovers', description: 'Snorlax x5', cost: 20000000000, type: 'HELPER_MULTIPLIER', targetId: 'snorlax', value: 5, purchased: false, icon: '🍖', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'snorlax', amount: 25 } },

  // HELPER UPGRADES - Tyranitar
  { id: 'tyranitar_t1', name: 'Tyranitar Training', description: 'Tyranitar x2', cost: 30000000000, type: 'HELPER_MULTIPLIER', targetId: 'tyranitar', value: 2, purchased: false, icon: '🦖', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'tyranitar', amount: 10 } },

  // HELPER UPGRADES - Salamence
  { id: 'salamence_t1', name: 'Salamence Training', description: 'Salamence x2', cost: 400000000000, type: 'HELPER_MULTIPLIER', targetId: 'salamence', value: 2, purchased: false, icon: '🐲', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'salamence', amount: 10 } },

  // HELPER UPGRADES - Mewtwo
  { id: 'mewtwo_t1', name: 'Mewtwo Training', description: 'Mewtwo x2', cost: 5000000000000, type: 'HELPER_MULTIPLIER', targetId: 'mewtwo', value: 2, purchased: false, icon: '🧬', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'mewtwo', amount: 10 } },
  { id: 'mewtwo_t2', name: 'Mega Stone X', description: 'Mewtwo x5', cost: 50000000000000, type: 'HELPER_MULTIPLIER', targetId: 'mewtwo', value: 5, purchased: false, icon: '💎', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'mewtwo', amount: 25 } },

  // HELPER UPGRADES - Rayquaza
  { id: 'rayquaza_t1', name: 'Rayquaza Training', description: 'Rayquaza x2', cost: 70000000000000, type: 'HELPER_MULTIPLIER', targetId: 'rayquaza', value: 2, purchased: false, icon: '🌪️', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'rayquaza', amount: 10 } },

  // HELPER UPGRADES - Dialga
  { id: 'dialga_t1', name: 'Dialga Training', description: 'Dialga x2', cost: 850000000000000, type: 'HELPER_MULTIPLIER', targetId: 'dialga', value: 2, purchased: false, icon: '⏰', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'dialga', amount: 10 } },

  // HELPER UPGRADES - Arceus
  { id: 'arceus_t1', name: 'Arceus Training', description: 'Arceus x2', cost: 10000000000000000, type: 'HELPER_MULTIPLIER', targetId: 'arceus', value: 2, purchased: false, icon: '✨', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'arceus', amount: 10 } },
  { id: 'arceus_t2', name: 'Divine Plate', description: 'Arceus x5', cost: 100000000000000000, type: 'HELPER_MULTIPLIER', targetId: 'arceus', value: 5, purchased: false, icon: '🌈', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'arceus', amount: 25 } },

  // HELPER UPGRADES - Giratina
  { id: 'giratina_t1', name: 'Giratina Training', description: 'Giratina x2', cost: 130000000000000000, type: 'HELPER_MULTIPLIER', targetId: 'giratina', value: 2, purchased: false, icon: '👿', category: 'helper', condition: { type: 'HELPER_COUNT', targetId: 'giratina', amount: 10 } },

  // ==========================================
  // EVOLUTION UPGRADES - Unlocked when Pokemon evolve!
  // ==========================================

  // Raichu Evolution Upgrade (Pikachu evolves at 25)
  { id: 'raichu_power', name: 'Raichu Power', description: 'All Electric x3', cost: 50000, type: 'GLOBAL_MULTIPLIER', value: 3, purchased: false, icon: '⚡', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'pikachu', amount: 25, evolutionName: 'Raichu' } },

  // Charmeleon Evolution Upgrade (Charmander evolves at 15)
  { id: 'charmeleon_fury', name: 'Charmeleon Fury', description: 'Charmander x3', cost: 25000, type: 'HELPER_MULTIPLIER', targetId: 'charmander', value: 3, purchased: false, icon: '🔥', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'charmander', amount: 15, evolutionName: 'Charmeleon' } },

  // Charizard Evolution Upgrade (Charmander evolves at 35)
  { id: 'charizard_blaze', name: 'Charizard Blaze', description: 'All Fire x5', cost: 500000, type: 'GLOBAL_MULTIPLIER', value: 5, purchased: false, icon: '🔥', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'charmander', amount: 35, evolutionName: 'Charizard' } },

  // Wartortle Evolution Upgrade (Squirtle evolves at 15)
  { id: 'wartortle_shell', name: 'Wartortle Shell', description: 'Squirtle x3', cost: 75000, type: 'HELPER_MULTIPLIER', targetId: 'squirtle', value: 3, purchased: false, icon: '💧', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'squirtle', amount: 15, evolutionName: 'Wartortle' } },

  // Blastoise Evolution Upgrade (Squirtle evolves at 35)
  { id: 'blastoise_hydro', name: 'Blastoise Hydro Pump', description: 'All Water x5', cost: 2500000, type: 'GLOBAL_MULTIPLIER', value: 5, purchased: false, icon: '💧', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'squirtle', amount: 35, evolutionName: 'Blastoise' } },

  // Ivysaur Evolution Upgrade (Bulbasaur evolves at 15)
  { id: 'ivysaur_growth', name: 'Ivysaur Growth', description: 'Bulbasaur x3', cost: 500000, type: 'HELPER_MULTIPLIER', targetId: 'bulbasaur', value: 3, purchased: false, icon: '🌿', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'bulbasaur', amount: 15, evolutionName: 'Ivysaur' } },

  // Venusaur Evolution Upgrade (Bulbasaur evolves at 35)
  { id: 'venusaur_solar', name: 'Venusaur Solar Beam', description: 'All Grass x5', cost: 15000000, type: 'GLOBAL_MULTIPLIER', value: 5, purchased: false, icon: '🌿', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'bulbasaur', amount: 35, evolutionName: 'Venusaur' } },

  // Vaporeon Evolution Upgrade (Eevee evolves at 10)
  { id: 'vaporeon_aqua', name: 'Vaporeon Aqua Ring', description: 'Eevee x2', cost: 5000000, type: 'HELPER_MULTIPLIER', targetId: 'eevee', value: 2, purchased: false, icon: '💧', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'eevee', amount: 10, evolutionName: 'Vaporeon' } },

  // Jolteon Evolution Upgrade (Eevee evolves at 25)
  { id: 'jolteon_thunder', name: 'Jolteon Thunder', description: 'Click x10', cost: 25000000, type: 'CLICK_MULTIPLIER', value: 10, purchased: false, icon: '⚡', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'eevee', amount: 25, evolutionName: 'Jolteon' } },

  // Flareon Evolution Upgrade (Eevee evolves at 50)
  { id: 'flareon_flare', name: 'Flareon Flare Blitz', description: 'All x2', cost: 100000000, type: 'GLOBAL_MULTIPLIER', value: 2, purchased: false, icon: '🔥', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'eevee', amount: 50, evolutionName: 'Flareon' } },

  // Espeon Evolution Upgrade (Eevee evolves at 75)
  { id: 'espeon_psychic', name: 'Espeon Psychic', description: 'All x3', cost: 500000000, type: 'GLOBAL_MULTIPLIER', value: 3, purchased: false, icon: '🔮', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'eevee', amount: 75, evolutionName: 'Espeon' } },

  // Umbreon Evolution Upgrade (Eevee evolves at 100)
  { id: 'umbreon_dark', name: 'Umbreon Dark Pulse', description: 'All x5', cost: 2000000000, type: 'GLOBAL_MULTIPLIER', value: 5, purchased: false, icon: '🌙', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'eevee', amount: 100, evolutionName: 'Umbreon' } },

  // Haunter Evolution Upgrade (Gastly evolves at 15)
  { id: 'haunter_curse', name: 'Haunter Curse', description: 'Gengar x3', cost: 50000000, type: 'HELPER_MULTIPLIER', targetId: 'gengar', value: 3, purchased: false, icon: '👻', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'gengar', amount: 15, evolutionName: 'Haunter' } },

  // Gengar Evolution Upgrade (Gastly evolves at 35)
  { id: 'gengar_shadow', name: 'Gengar Shadow Ball', description: 'All Ghost x5', cost: 500000000, type: 'GLOBAL_MULTIPLIER', value: 5, purchased: false, icon: '👻', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'gengar', amount: 35, evolutionName: 'Gengar' } },

  // Dragonair Evolution Upgrade (Dratini evolves at 15)
  { id: 'dragonair_grace', name: 'Dragonair Grace', description: 'Dragonite x3', cost: 500000000, type: 'HELPER_MULTIPLIER', targetId: 'dragonite', value: 3, purchased: false, icon: '🐉', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'dragonite', amount: 15, evolutionName: 'Dragonair' } },

  // Dragonite Evolution Upgrade (Dratini evolves at 35)
  { id: 'dragonite_outrage', name: 'Dragonite Outrage', description: 'All Dragon x5', cost: 5000000000, type: 'GLOBAL_MULTIPLIER', value: 5, purchased: false, icon: '🐉', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'dragonite', amount: 35, evolutionName: 'Dragonite' } },

  // Snorlax Evolution Upgrade (Munchlax evolves at 25)
  { id: 'snorlax_rest', name: 'Snorlax Rest', description: 'Snorlax x5', cost: 10000000000, type: 'HELPER_MULTIPLIER', targetId: 'snorlax', value: 5, purchased: false, icon: '😴', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'snorlax', amount: 25, evolutionName: 'Snorlax' } },

  // Pupitar Evolution Upgrade (Larvitar evolves at 15)
  { id: 'pupitar_harden', name: 'Pupitar Harden', description: 'Tyranitar x3', cost: 100000000000, type: 'HELPER_MULTIPLIER', targetId: 'tyranitar', value: 3, purchased: false, icon: '🦖', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'tyranitar', amount: 15, evolutionName: 'Pupitar' } },

  // Tyranitar Evolution Upgrade (Larvitar evolves at 35)
  { id: 'tyranitar_crunch', name: 'Tyranitar Crunch', description: 'All Rock x5', cost: 1000000000000, type: 'GLOBAL_MULTIPLIER', value: 5, purchased: false, icon: '🦖', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'tyranitar', amount: 35, evolutionName: 'Tyranitar' } },

  // Shelgon Evolution Upgrade (Bagon evolves at 15)
  { id: 'shelgon_protect', name: 'Shelgon Protect', description: 'Salamence x3', cost: 2000000000000, type: 'HELPER_MULTIPLIER', targetId: 'salamence', value: 3, purchased: false, icon: '🐲', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'salamence', amount: 15, evolutionName: 'Shelgon' } },

  // Salamence Evolution Upgrade (Bagon evolves at 35)
  { id: 'salamence_fly', name: 'Salamence Fly', description: 'All Flying x5', cost: 20000000000000, type: 'GLOBAL_MULTIPLIER', value: 5, purchased: false, icon: '🐲', category: 'evolution', condition: { type: 'EVOLUTION', targetId: 'salamence', amount: 35, evolutionName: 'Salamence' } },
];