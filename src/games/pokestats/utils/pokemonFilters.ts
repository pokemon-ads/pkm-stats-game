import type { FilterOptions } from "../types/game";
import {
  GENERATIONS,
  LEGENDARY_IDS,
  MYTHICAL_IDS,
  MEGA_EVOLUTION_IDS,
  GIGANTAMAX_IDS,
  ULTRA_BEAST_IDS,
  LEGENDS_ZA_MEGA_IDS,
  PARADOX_IDS,
  ALOLA_FORM_IDS,
  GALAR_FORM_IDS,
  HISUI_FORM_IDS,
  PALDEA_FORM_IDS,
} from "../../../types/pokemon";
import { POKEMON_CONFIG, FILTER_MODES } from "../config/constants";
import { pokemonService } from "../../../services/pokemon.service";
import { externalDataService } from "../../../services/external/ExternalDataService";

/**
 * Generates a pool of Pokemon IDs based on the provided filter options.
 */
export const generatePokemonPool = async (
  filterOptions: FilterOptions
): Promise<number[]> => {
  const filterMode = filterOptions.filterMode || FILTER_MODES.AND;

  // Base pool: All Pokemon (Gen 1-9)
  let basePool: number[] = Array.from(
    { length: POKEMON_CONFIG.TOTAL_POKEMON },
    (_, i) => i + POKEMON_CONFIG.FIRST_POKEMON_ID
  );

  // In AND mode, apply generation as base pool restriction
  if (filterMode === FILTER_MODES.AND) {
    // Legacy single-value support
    if (
      filterOptions.generation &&
      GENERATIONS[filterOptions.generation as keyof typeof GENERATIONS]
    ) {
      const generation =
        GENERATIONS[filterOptions.generation as keyof typeof GENERATIONS];
      basePool = Array.from(
        { length: generation.range[1] - generation.range[0] + 1 },
        (_, i) => generation.range[0] + i
      );
    }
  }

  if (filterMode === FILTER_MODES.OR) {
    // OR mode: Union of all filters
    const pools: number[][] = [];

    // Generations filter (multiple selection)
    if (filterOptions.generations && filterOptions.generations.length > 0) {
      filterOptions.generations.forEach((genKey) => {
        const generation = GENERATIONS[genKey as keyof typeof GENERATIONS];
        if (generation) {
          const genPool = Array.from(
            { length: generation.range[1] - generation.range[0] + 1 },
            (_, i) => generation.range[0] + i
          );
          pools.push(genPool);
        }
      });
    }

    // Types filter (multiple selection)
    if (filterOptions.types && filterOptions.types.length > 0) {
      for (const type of filterOptions.types) {
        let typePokemonIds = await pokemonService.getTypePokemonIds(type);
        
        // In OR mode, we typically only want to show external/special Pokemon
        // if their specific category filter is enabled.
        // So we filter out external IDs from the generic Type filter here.
        // They will be added back if the "Legends Z-A" filter is enabled.
        typePokemonIds = typePokemonIds.filter(id => !externalDataService.handlesId(id));
        
        pools.push(typePokemonIds);
      }
    }

    // Legendary filter
    if (filterOptions.legendary) {
      pools.push(LEGENDARY_IDS);
    }

    // Mythical filter
    if (filterOptions.mythical) {
      pools.push(MYTHICAL_IDS);
    }

    // Mega evolution filter
    if (filterOptions.mega) {
      pools.push(MEGA_EVOLUTION_IDS);
    }

    // Gigantamax filter
    if (filterOptions.gigantamax) {
      pools.push(GIGANTAMAX_IDS);
    }

    // Ultra beast filter
    if (filterOptions.ultraBeast) {
      pools.push(ULTRA_BEAST_IDS);
    }

    // Legends Z-A mega filter
    if (filterOptions.legendsZA) {
      pools.push(LEGENDS_ZA_MEGA_IDS);
      // Add external Legends Z-A data
      pools.push(externalDataService.getSourceIds("legends_za"));
    }

    // Paradox filter
    if (filterOptions.paradox) {
      pools.push(PARADOX_IDS);
    }

    // Regional forms filter (multiple selection)
    if (
      filterOptions.regionalForms &&
      filterOptions.regionalForms.length > 0
    ) {
      filterOptions.regionalForms.forEach((form) => {
        const formIds = {
          alola: ALOLA_FORM_IDS,
          galar: GALAR_FORM_IDS,
          hisui: HISUI_FORM_IDS,
          paldea: PALDEA_FORM_IDS,
        }[form];
        if (formIds) {
          pools.push(formIds);
        }
      });
    }

    // If no filters applied, return base pool
    if (pools.length === 0) {
      return basePool;
    }

    // Union: combine all pools and remove duplicates
    const unionPool = [...new Set(pools.flat())];
    return unionPool;
  } else {
    // AND mode: Intersection of all filters
    let pool = [...basePool];

    // If Legends Z-A filter is active, include external Z-A Pokemon in the starting pool
    // so they can be filtered by Type, etc.
    if (filterOptions.legendsZA) {
      const zaIds = externalDataService.getSourceIds("legends_za");
      pool = [...pool, ...zaIds];
    }

    // Apply generations filter (multiple selection with union within category)
    if (filterOptions.generations && filterOptions.generations.length > 0) {
      const genPools: number[][] = [];
      filterOptions.generations.forEach((genKey) => {
        const generation = GENERATIONS[genKey as keyof typeof GENERATIONS];
        if (generation) {
          const genPool = Array.from(
            { length: generation.range[1] - generation.range[0] + 1 },
            (_, i) => generation.range[0] + i
          );
          genPools.push(genPool);
        }
      });
      // Union of selected generations (Gen 1 OR Gen 2)
      const genUnion = [...new Set(genPools.flat())];
      pool = pool.filter((id) => genUnion.includes(id));
    }

    // Apply types filter (multiple selection with INTERSECTION - must have ALL selected types)
    if (filterOptions.types && filterOptions.types.length > 0) {
      for (const type of filterOptions.types) {
        const typePokemonIds = await pokemonService.getTypePokemonIds(type);
        // Intersect: keep only Pokemon that have this type
        pool = pool.filter((id) => typePokemonIds.includes(id));
      }
    }

    // Apply legendary filter
    if (filterOptions.legendary) {
      pool = pool.filter((id) => LEGENDARY_IDS.includes(id));
    }

    // Apply mythical filter
    if (filterOptions.mythical) {
      pool = pool.filter((id) => MYTHICAL_IDS.includes(id));
    }

    // Apply mega evolution filter
    if (filterOptions.mega) {
      pool = pool.filter((id) => MEGA_EVOLUTION_IDS.includes(id));
    }

    // Apply gigantamax filter
    if (filterOptions.gigantamax) {
      pool = pool.filter((id) => GIGANTAMAX_IDS.includes(id));
    }

    // Apply ultra beast filter
    if (filterOptions.ultraBeast) {
      pool = pool.filter((id) => ULTRA_BEAST_IDS.includes(id));
    }

    // Apply Legends Z-A mega filter
    if (filterOptions.legendsZA) {
      const zaIds = externalDataService.getSourceIds("legends_za");
      pool = pool.filter((id) => LEGENDS_ZA_MEGA_IDS.includes(id) || zaIds.includes(id));
    }

    // Apply Paradox filter
    if (filterOptions.paradox) {
      pool = pool.filter((id) => PARADOX_IDS.includes(id));
    }

    // Apply regional forms filter (multiple selection with union)
    if (
      filterOptions.regionalForms &&
      filterOptions.regionalForms.length > 0
    ) {
      const formPools: number[][] = [];
      filterOptions.regionalForms.forEach((form) => {
        const formIds = {
          alola: ALOLA_FORM_IDS,
          galar: GALAR_FORM_IDS,
          hisui: HISUI_FORM_IDS,
          paldea: PALDEA_FORM_IDS,
        }[form];
        if (formIds) {
          formPools.push(formIds);
        }
      });
      // Union of selected regional forms
      const formUnion = [...new Set(formPools.flat())];
      pool = pool.filter((id) => formUnion.includes(id));
    }

    return pool;
  }
};