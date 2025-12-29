import { useState, useCallback } from "react";
import type { FilterOptions } from "../types/game";
import { generatePokemonPool } from "../utils/pokemonFilters";

export const usePokemonPool = () => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [pokemonPool, setPokemonPool] = useState<number[]>([]);
  const [isGeneratingPool, setIsGeneratingPool] = useState(false);

  const updateFilterMode = useCallback((mode: "AND" | "OR") => {
    setFilters((prev) => ({
      ...prev,
      filterMode: mode,
    }));
  }, []);

  const initializePool = useCallback(async (filterOptions: FilterOptions) => {
    setIsGeneratingPool(true);
    try {
      const pool = await generatePokemonPool(filterOptions);
      setPokemonPool(pool);
      setFilters(filterOptions);
      return pool;
    } catch (error) {
      console.error("Error generating Pokemon pool:", error);
      setPokemonPool([]);
      return [];
    } finally {
      setIsGeneratingPool(false);
    }
  }, []);

  const resetPool = useCallback(() => {
    setPokemonPool([]);
    setFilters({});
  }, []);

  return {
    filters,
    setFilters,
    pokemonPool,
    isGeneratingPool,
    updateFilterMode,
    initializePool,
    resetPool,
  };
};