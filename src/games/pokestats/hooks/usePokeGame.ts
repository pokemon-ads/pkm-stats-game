import { useState, useCallback } from "react";
import type {
  Pokemon,
  StatName,
} from "../../../types/pokemon";
import type {
  GameState,
  FilterOptions,
} from "../types/game";
import {
  GAME_CONFIG,
  STAT_ORDER,
  GAME_PHASES,
} from "../config/constants";
import { pokemonService } from "../../../services/pokemon.service";
import { useGameSettings } from "./useGameSettings";
import { usePokemonPool } from "./usePokemonPool";

export const usePokeGame = () => {
  // --- Sub-hooks ---
  const {
    skipConfirmation,
    shinyBonus,
    updateSkipConfirmation,
    updateShinyBonus,
    setSkipConfirmation,
  } = useGameSettings();

  const {
    filters,
    setFilters,
    pokemonPool,
    isGeneratingPool,
    updateFilterMode,
    initializePool,
    resetPool,
  } = usePokemonPool();

  // --- Game State ---
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

  const [loading, setLoading] = useState(false);

  // --- Actions ---

  // Start game with filters
  const startGame = useCallback(
    async (
      targetTotal: number,
      filterOptions: FilterOptions,
      skipConfirmationMode: boolean
    ) => {
      setLoading(true);
      
      // Initialize pool via the sub-hook
      await initializePool(filterOptions);
      
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
    [initializePool, setSkipConfirmation]
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
        
        const pokemon = await pokemonService.fetchPokemonWithForm(
          randomId,
          {
            useMega: !!(filters.mega || filters.legendsZA),
            useGigantamax: !!filters.gigantamax,
            regionalForms: filters.regionalForms ||
              (filters.regionalForm ? [filters.regionalForm] : undefined)
          }
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
    resetPool();
  }, [resetPool]);

  // Restart game with same filters and target
  const restartWithSameFilters = useCallback(() => {
    // We don't need to regenerate the pool if filters haven't changed
    // But startGame calls initializePool which regenerates it.
    // Optimization: We could pass the existing pool if we wanted, 
    // but for now let's keep it simple and consistent with startGame signature.
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

  return {
    gameState,
    loading: loading || isGeneratingPool,
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
