import { ExternalDataSource } from "./ExternalDataSource";
import { LegendsZASource } from "./LegendsZASource";
import type { Pokemon } from "../../types/pokemon";

class ExternalDataService {
  private sources: Map<string, ExternalDataSource> = new Map();

  constructor() {
    this.registerSource(new LegendsZASource());
  }

  registerSource(source: ExternalDataSource) {
    this.sources.set(source.getSourceKey(), source);
  }

  getSource(key: string): ExternalDataSource | undefined {
    return this.sources.get(key);
  }

  /**
   * Check if any registered source handles the given ID
   */
  handlesId(id: number): boolean {
    for (const source of this.sources.values()) {
      if (source.handlesId(id)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get Pokemon from the appropriate source
   */
  async getPokemon(id: number): Promise<Pokemon | undefined> {
    for (const source of this.sources.values()) {
      if (source.handlesId(id)) {
        return source.getPokemon(id);
      }
    }
    return undefined;
  }

  /**
   * Get all IDs from a specific source
   */
  getSourceIds(sourceKey: string): number[] {
    const source = this.sources.get(sourceKey);
    return source ? source.getPokemonIds() : [];
  }

  /**
   * Get all external Pokemon IDs that match a specific type
   */
  getTypePokemonIds(type: string): number[] {
    let ids: number[] = [];
    for (const source of this.sources.values()) {
      ids = [...ids, ...source.getPokemonIdsByType(type)];
    }
    return ids;
  }
}

export const externalDataService = new ExternalDataService();