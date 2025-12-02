import type { Pokemon } from "../../types/pokemon";

export abstract class ExternalDataSource {
  /**
   * Unique identifier for the data source
   */
  abstract getSourceKey(): string;

  /**
   * Get all Pokemon IDs provided by this source
   */
  abstract getPokemonIds(): number[];

  /**
   * Get Pokemon IDs from this source that match a specific type
   */
  abstract getPokemonIdsByType(type: string): number[];

  /**
   * Get a specific Pokemon by ID
   */
  abstract getPokemon(id: number): Promise<Pokemon | undefined>;

  /**
   * Check if this source handles the given ID
   */
  abstract handlesId(id: number): boolean;
}