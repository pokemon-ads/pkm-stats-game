import { ExternalDataSource } from "./ExternalDataSource";
import type { Pokemon } from "../../types/pokemon";
import zaData from "../../assets/za.json";

interface ZAEntry {
  name: string;
  types: string[];
  base_stats: {
    hp: number;
    attack: number;
    defense: number;
    sp_attack: number;
    sp_defense: number;
    speed: number;
  };
  art_url: string;
  art_url_shiny?: string;
}

export class LegendsZASource extends ExternalDataSource {
  private static readonly START_ID = 90000;
  private static readonly SOURCE_KEY = "legends_za";
  protected pokemonCache: Map<number, Pokemon> = new Map();
  protected ids: number[] = [];

  constructor() {
    super();
    this.load();
  }

  getSourceKey(): string {
    return LegendsZASource.SOURCE_KEY;
  }

  load(): void {
    const entries = zaData as ZAEntry[];
    
    entries.forEach((entry, index) => {
      const id = LegendsZASource.START_ID + index;
      const pokemon: Pokemon = {
        id: id,
        name: entry.name,
        sprites: {
          front_default: entry.art_url,
          front_shiny: entry.art_url_shiny || entry.art_url
        },
        stats: [
          { base_stat: entry.base_stats.hp, stat: { name: 'hp' } },
          { base_stat: entry.base_stats.attack, stat: { name: 'attack' } },
          { base_stat: entry.base_stats.defense, stat: { name: 'defense' } },
          { base_stat: entry.base_stats.sp_attack, stat: { name: 'special-attack' } },
          { base_stat: entry.base_stats.sp_defense, stat: { name: 'special-defense' } },
          { base_stat: entry.base_stats.speed, stat: { name: 'speed' } }
        ],
        types: entry.types.map(t => ({
          type: { name: t.toLowerCase() }
        })),
        species: {
          url: "" // No species URL
        },
        cries: {
          latest: "", // No cry available for external Pokemon
          legacy: ""
        }
      };

      this.pokemonCache.set(id, pokemon);
      this.ids.push(id);
    });
  }

  getPokemonIds(): number[] {
    return this.ids;
  }

  getPokemonIdsByType(type: string): number[] {
    return this.ids.filter(id => {
      const pokemon = this.pokemonCache.get(id);
      return pokemon?.types.some(t => t.type.name === type.toLowerCase());
    });
  }

  async getPokemon(id: number): Promise<Pokemon | undefined> {
    return this.pokemonCache.get(id);
  }

  handlesId(id: number): boolean {
    return id >= LegendsZASource.START_ID && id < LegendsZASource.START_ID + this.ids.length;
  }
}