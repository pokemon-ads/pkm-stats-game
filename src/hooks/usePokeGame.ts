import { useState, useCallback } from "react";
import * as PokeAPI from "pokeapi-js-wrapper";
import type {
  GameState,
  Pokemon,
  StatName,
  FilterOptions,
  PokemonSpecies,
} from "../types/pokemon";
import {
  GENERATIONS,
  LEGENDARY_IDS,
  MYTHICAL_IDS,
  MEGA_EVOLUTION_IDS,
  GIGANTAMAX_IDS,
  ULTRA_BEAST_IDS,
  LEGENDS_ZA_MEGA_IDS,
  PARADOX_IDS,
  MEGA_FORMS,
  GIGANTAMAX_FORMS,
  ALOLA_FORM_IDS,
  GALAR_FORM_IDS,
  HISUI_FORM_IDS,
  PALDEA_FORM_IDS,
  REGIONAL_FORMS,
} from "../types/pokemon";
import {
  GAME_CONFIG,
  POKEMON_CONFIG,
  STORAGE_KEYS,
  STAT_ORDER,
  GAME_PHASES,
  FILTER_MODES,
} from "../config/constants";

const P = new PokeAPI.Pokedex();

export const usePokeGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: GAME_PHASES.SETUP,
    targetTotal: GAME_CONFIG.DEFAULT_TARGET_TOTAL,
    currentRound: 0,
    selectedStats: [],
    currentPokemon: null,
    availableStats: [...STAT_ORDER],
    selectedStatName: null,
    statsRevealed: false,
  });

  const [filters, setFilters] = useState<FilterOptions>({});
  const [pokemonPool, setPokemonPool] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [skipConfirmation, setSkipConfirmation] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SKIP_CONFIRMATION);
    return saved === "true";
  });
  const [shinyBonus, setShinyBonus] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHINY_BONUS);
    return saved === "true";
  });

  // Generate Pokemon pool based on filters
  const generatePokemonPool = useCallback(
    async (filterOptions: FilterOptions) => {
      const filterMode = filterOptions.filterMode || FILTER_MODES.AND;

      // Base pool: All Pokemon (Gen 1-9) - we'll filter by generations in OR mode
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
            try {
              const typeData = (await P.getTypeByName(type)) as any;
              const typePokemonIds = typeData.pokemon
                .map((p: any) => {
                  const urlParts = p.pokemon.url.split("/");
                  return parseInt(urlParts[urlParts.length - 2]);
                })
                .filter((id: number) => id <= POKEMON_CONFIG.TOTAL_POKEMON);
              pools.push(typePokemonIds);
            } catch (error) {
              console.error(`Error fetching type data for ${type}:`, error);
            }
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
            try {
              const typeData = (await P.getTypeByName(type)) as any;
              const typePokemonIds = typeData.pokemon
                .map((p: any) => {
                  const urlParts = p.pokemon.url.split("/");
                  return parseInt(urlParts[urlParts.length - 2]);
                })
                .filter((id: number) => id <= POKEMON_CONFIG.TOTAL_POKEMON);

              // Intersect: keep only Pokemon that have this type
              pool = pool.filter((id) => typePokemonIds.includes(id));
            } catch (error) {
              console.error(`Error fetching type data for ${type}:`, error);
            }
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
          pool = pool.filter((id) => LEGENDS_ZA_MEGA_IDS.includes(id));
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
    },
    []
  );

  // Fetch special form (regional, mega evolution or gigantamax) if needed
  const fetchPokemonForm = useCallback(
    async (
      baseId: number,
      useMega: boolean,
      useGigantamax: boolean,
      regionalForms?: string[]
    ): Promise<Pokemon> => {
      // Priority: Regional Form > Gigantamax > Mega > Base form

      // Try Regional forms if specified
      if (regionalForms && regionalForms.length > 0) {
        // Try each regional form in order
        for (const form of regionalForms) {
          if (REGIONAL_FORMS[form]) {
            const formVariants = REGIONAL_FORMS[form][baseId];
            if (formVariants && formVariants.length > 0) {
              try {
                // If multiple regional forms, pick one randomly
                const formName =
                  formVariants[Math.floor(Math.random() * formVariants.length)];
                return (await P.getPokemonByName(formName)) as Pokemon;
              } catch (error) {
                console.error(
                  `Error fetching ${form} form, trying next:`,
                  error
                );
              }
            }
          }
        }
      }

      // Try Gigantamax form
      if (useGigantamax && GIGANTAMAX_FORMS[baseId]) {
        try {
          return (await P.getPokemonByName(
            GIGANTAMAX_FORMS[baseId]
          )) as Pokemon;
        } catch (error) {
          console.error(
            "Error fetching Gigantamax form, trying base form:",
            error
          );
          return (await P.getPokemonByName(baseId)) as Pokemon;
        }
      }

      // Try Mega form
      if (useMega && MEGA_FORMS[baseId]) {
        // Get mega form(s)
        const megaForms = MEGA_FORMS[baseId];
        // If multiple mega forms, pick one randomly
        const megaForm =
          megaForms[Math.floor(Math.random() * megaForms.length)];

        try {
          return (await P.getPokemonByName(megaForm)) as Pokemon;
        } catch (error) {
          console.error("Error fetching mega form, using base form:", error);
          return (await P.getPokemonByName(baseId)) as Pokemon;
        }
      }

      return (await P.getPokemonByName(baseId)) as Pokemon;
    },
    []
  );

  // Start game with filters
  const startGame = useCallback(
    async (
      targetTotal: number,
      filterOptions: FilterOptions,
      skipConfirmationMode: boolean
    ) => {
      setLoading(true);
      const pool = await generatePokemonPool(filterOptions);
      setPokemonPool(pool);
      setFilters(filterOptions);
      setSkipConfirmation(skipConfirmationMode);

      setGameState({
        phase: GAME_PHASES.PLAYING,
        targetTotal,
        currentRound: 0,
        selectedStats: [],
        currentPokemon: null,
        availableStats: [...STAT_ORDER],
        selectedStatName: null,
        statsRevealed: false,
      });

      setLoading(false);
    },
    [generatePokemonPool]
  );

  // Draw a random Pokemon from the pool
  const drawPokemon = useCallback(async () => {
    if (pokemonPool.length === 0) return;

    setLoading(true);
    let attempts = 0;
    const maxAttempts = GAME_CONFIG.MAX_FETCH_ATTEMPTS;

    while (attempts < maxAttempts) {
      try {
        const randomId =
          pokemonPool[Math.floor(Math.random() * pokemonPool.length)];
        const pokemon = await fetchPokemonForm(
          randomId,
          !!(filters.mega || filters.legendsZA),
          !!filters.gigantamax,
          filters.regionalForms ||
            (filters.regionalForm ? [filters.regionalForm] : undefined)
        );

        // Determine if this Pokemon is shiny
        const isShiny = Math.random() < 1 / GAME_CONFIG.SHINY_PROBABILITY;
        const pokemonWithShiny = {
          ...pokemon,
          isShiny,
        } as Pokemon;

        setGameState((prev) => ({
          ...prev,
          currentPokemon: pokemonWithShiny,
          currentRound: prev.currentRound + 1,
          selectedStatName: null,
          statsRevealed: false,
        }));
        setLoading(false);
        return;
      } catch (error) {
        console.error("Error fetching Pokemon:", error);
      }
      attempts++;
    }

    // If we couldn't find a matching Pokemon after max attempts, try again
    setLoading(false);
    console.warn("Could not find matching Pokemon, retrying...");
    setTimeout(() => drawPokemon(), GAME_CONFIG.RETRY_DELAY);
  }, [
    pokemonPool,
    filters.mega,
    filters.legendsZA,
    filters.gigantamax,
    filters.regionalForms,
    filters.regionalForm,
    fetchPokemonForm,
  ]);

  // Select a stat (with or without confirmation based on preference)
  const selectStatName = useCallback(
    (statName: StatName) => {
      if (skipConfirmation) {
        // Direct selection without confirmation
        if (!gameState.currentPokemon) return;

        const statData = gameState.currentPokemon.stats.find(
          (s) => s.stat.name === statName
        );

        if (!statData) return;

        // Apply shiny bonus if enabled
        const statValue =
          shinyBonus && gameState.currentPokemon.isShiny
            ? statData.base_stat * GAME_CONFIG.SHINY_BONUS_MULTIPLIER
            : statData.base_stat;

        const newSelectedStats = [
          ...gameState.selectedStats,
          {
            pokemon: gameState.currentPokemon,
            statName: statName,
            value: statValue,
          },
        ];

        const newAvailableStats = gameState.availableStats.filter(
          (s) => s !== statName
        );

        if (newSelectedStats.length === GAME_CONFIG.ROUNDS_PER_GAME) {
          // Game over - calculate result
          setGameState((prev) => ({
            ...prev,
            phase: GAME_PHASES.RESULT,
            selectedStats: newSelectedStats,
            availableStats: newAvailableStats,
            statsRevealed: true,
            selectedStatName: statName,
          }));
        } else {
          // Continue to next round
          setGameState((prev) => ({
            ...prev,
            selectedStats: newSelectedStats,
            currentPokemon: null,
            availableStats: newAvailableStats,
            selectedStatName: statName,
            statsRevealed: true,
          }));
        }
      } else {
        // Show confirmation modal
        setGameState((prev) => ({
          ...prev,
          selectedStatName: statName,
        }));
      }
    },
    [skipConfirmation, shinyBonus, gameState]
  );

  // Confirm selection and reveal the value
  const confirmSelection = useCallback(() => {
    if (!gameState.currentPokemon || !gameState.selectedStatName) return;

    const statData = gameState.currentPokemon.stats.find(
      (s) => s.stat.name === gameState.selectedStatName
    );

    if (!statData) return;

    // Apply shiny bonus if enabled
    const statValue =
      shinyBonus && gameState.currentPokemon.isShiny
        ? statData.base_stat * GAME_CONFIG.SHINY_BONUS_MULTIPLIER
        : statData.base_stat;

    const newSelectedStats = [
      ...gameState.selectedStats,
      {
        pokemon: gameState.currentPokemon,
        statName: gameState.selectedStatName,
        value: statValue,
      },
    ];

    const newAvailableStats = gameState.availableStats.filter(
      (s) => s !== gameState.selectedStatName
    );

    if (newSelectedStats.length === GAME_CONFIG.ROUNDS_PER_GAME) {
      // Game over - calculate result
      setGameState((prev) => ({
        ...prev,
        phase: GAME_PHASES.RESULT,
        selectedStats: newSelectedStats,
        availableStats: newAvailableStats,
        statsRevealed: true,
      }));
    } else {
      // Continue to next round
      setGameState((prev) => ({
        ...prev,
        selectedStats: newSelectedStats,
        currentPokemon: null,
        availableStats: newAvailableStats,
        selectedStatName: null,
        statsRevealed: true,
      }));
    }
  }, [shinyBonus, gameState]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState({
      phase: GAME_PHASES.SETUP,
      targetTotal: GAME_CONFIG.DEFAULT_TARGET_TOTAL,
      currentRound: 0,
      selectedStats: [],
      currentPokemon: null,
      availableStats: [...STAT_ORDER],
      selectedStatName: null,
      statsRevealed: false,
    });
    setPokemonPool([]);
    setFilters({});
  }, []);

  // Restart game with same filters and target
  const restartWithSameFilters = useCallback(() => {
    startGame(gameState.targetTotal, filters, skipConfirmation);
  }, [gameState.targetTotal, filters, skipConfirmation, startGame]);

  // Restart game with same filters but adjusted target
  const restartWithAdjustedTarget = useCallback(
    (adjustment: number) => {
      const newTarget = Math.max(
        GAME_CONFIG.MIN_TARGET_TOTAL,
        gameState.targetTotal + adjustment
      );
      startGame(newTarget, filters, skipConfirmation);
    },
    [gameState.targetTotal, filters, skipConfirmation, startGame]
  );

  // Calculate if player won
  const calculateResult = useCallback(() => {
    const totalStats = gameState.selectedStats.reduce(
      (sum, stat) => sum + stat.value,
      0
    );
    return {
      totalStats,
      targetTotal: gameState.targetTotal,
      won: totalStats >= gameState.targetTotal,
      difference: totalStats - gameState.targetTotal,
    };
  }, [gameState]);

  // Update target total during game
  const updateTargetTotal = useCallback((newTarget: number) => {
    setGameState((prev) => ({
      ...prev,
      targetTotal: newTarget,
    }));
  }, []);

  // Update filter mode during game
  const updateFilterMode = useCallback((mode: "AND" | "OR") => {
    setFilters((prev) => ({
      ...prev,
      filterMode: mode,
    }));
  }, []);

  // Update skip confirmation preference
  const updateSkipConfirmation = useCallback((value: boolean) => {
    setSkipConfirmation(value);
    localStorage.setItem(STORAGE_KEYS.SKIP_CONFIRMATION, value.toString());
  }, []);

  // Update shiny bonus preference
  const updateShinyBonus = useCallback((value: boolean) => {
    setShinyBonus(value);
    localStorage.setItem(STORAGE_KEYS.SHINY_BONUS, value.toString());
  }, []);

  return {
    gameState,
    loading,
    filters,
    skipConfirmation,
    shinyBonus,
    startGame,
    drawPokemon,
    selectStatName,
    confirmSelection,
    resetGame,
    restartWithSameFilters,
    restartWithAdjustedTarget,
    calculateResult,
    setFilters,
    updateTargetTotal,
    updateFilterMode,
    updateSkipConfirmation,
    updateShinyBonus,
  };
};
