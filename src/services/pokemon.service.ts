import * as PokeAPI from "pokeapi-js-wrapper";
import type { Pokemon } from "../types/pokemon";
import {
  REGIONAL_FORMS,
  GIGANTAMAX_FORMS,
  MEGA_FORMS,
} from "../types/pokemon";
import { POKEMON_CONFIG } from "../config/constants";
import { externalDataService } from "./external/ExternalDataService";

class PokemonService {
  private P: any;
  private typeCache: Map<string, number[]>;
  private pokemonCache: Map<string | number, Pokemon>;
  private speciesCache: Map<string | number, any>;

  constructor() {
    this.P = new PokeAPI.Pokedex();
    this.typeCache = new Map();
    this.pokemonCache = new Map();
    this.speciesCache = new Map();
  }

  /**
   * Fetch Pokemon IDs associated with a specific type
   */
  async getTypePokemonIds(type: string): Promise<number[]> {
    if (this.typeCache.has(type)) {
      return this.typeCache.get(type)!;
    }

    try {
      const typeData = (await this.P.getTypeByName(type)) as any;
      const typePokemonIds = typeData.pokemon
        .map((p: any) => {
          const urlParts = p.pokemon.url.split("/");
          return parseInt(urlParts[urlParts.length - 2]);
        })
        .filter((id: number) => id <= POKEMON_CONFIG.TOTAL_POKEMON);

      // Add external Pokemon IDs that match this type
      const externalTypeIds = externalDataService.getTypePokemonIds(type);
      const allTypeIds = [...typePokemonIds, ...externalTypeIds];

      this.typeCache.set(type, allTypeIds);
      return allTypeIds;
    } catch (error) {
      console.error(`Error fetching type data for ${type}:`, error);
      return [];
    }
  }

  /**
   * Fetch a Pokemon by ID or Name
   */
  async getPokemon(idOrName: number | string): Promise<Pokemon> {
    if (this.pokemonCache.has(idOrName)) {
      return this.pokemonCache.get(idOrName)!;
    }

    // Check external data sources first for numeric IDs
    if (typeof idOrName === 'number' && externalDataService.handlesId(idOrName)) {
      const externalPokemon = await externalDataService.getPokemon(idOrName);
      if (externalPokemon) {
        this.pokemonCache.set(idOrName, externalPokemon);
        return externalPokemon;
      }
    }

    try {
      const pokemon = (await this.P.getPokemonByName(idOrName)) as Pokemon;
      
      // Fetch species data to get localized names
      if (pokemon.species && pokemon.species.url) {
        try {
          const speciesId = parseInt(pokemon.species.url.split('/').filter(Boolean).pop()!);
          let speciesData;
          
          if (this.speciesCache.has(speciesId)) {
            speciesData = this.speciesCache.get(speciesId);
          } else {
            speciesData = await this.P.getPokemonSpeciesByName(speciesId);
            this.speciesCache.set(speciesId, speciesData);
          }

          const frName = speciesData.names.find((n: any) => n.language.name === 'fr')?.name;
          const enName = speciesData.names.find((n: any) => n.language.name === 'en')?.name;

          pokemon.names = {
            fr: frName || pokemon.name,
            en: enName || pokemon.name
          };
        } catch (e) {
          console.warn(`Could not fetch species data for ${pokemon.name}`, e);
          // Fallback to default name
          pokemon.names = {
            fr: pokemon.name,
            en: pokemon.name
          };
        }
      }

      this.pokemonCache.set(idOrName, pokemon);
      return pokemon;
    } catch (error) {
      console.error(`Error fetching Pokemon ${idOrName}:`, error);
      throw error;
    }
  }

  /**
   * Fetch a specific form of a Pokemon based on filters
   * Logic extracted from usePokeGame.ts
   */
  async fetchPokemonWithForm(
    baseId: number,
    options: {
      useMega: boolean;
      useGigantamax: boolean;
      regionalForms?: string[];
    }
  ): Promise<Pokemon> {
    const { useMega, useGigantamax, regionalForms } = options;

    // Priority: Regional Form > Gigantamax > Mega > Base form

    // 1. Try Regional forms if specified
    if (regionalForms && regionalForms.length > 0) {
      for (const form of regionalForms) {
        if (REGIONAL_FORMS[form]) {
          const formVariants = REGIONAL_FORMS[form][baseId];
          if (formVariants && formVariants.length > 0) {
            try {
              // If multiple regional forms, pick one randomly
              const formName =
                formVariants[Math.floor(Math.random() * formVariants.length)];
              return await this.getPokemon(formName);
            } catch (error) {
              console.error(
                `Error fetching ${form} form for ${baseId}, trying next:`,
                error
              );
            }
          }
        }
      }
    }

    // 2. Try Gigantamax form
    if (useGigantamax && GIGANTAMAX_FORMS[baseId]) {
      try {
        return await this.getPokemon(GIGANTAMAX_FORMS[baseId]);
      } catch (error) {
        console.error(
          `Error fetching Gigantamax form for ${baseId}, trying base form:`,
          error
        );
      }
    }

    // 3. Try Mega form
    if (useMega && MEGA_FORMS[baseId]) {
      const megaForms = MEGA_FORMS[baseId];
      const megaForm = megaForms[Math.floor(Math.random() * megaForms.length)];

      try {
        return await this.getPokemon(megaForm);
      } catch (error) {
        console.error(
          `Error fetching mega form for ${baseId}, using base form:`,
          error
        );
      }
    }

    // 4. Fallback to base form
    return await this.getPokemon(baseId);
  }
}

export const pokemonService = new PokemonService();