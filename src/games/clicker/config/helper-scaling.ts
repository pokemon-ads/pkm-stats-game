

import type { PokemonHelper } from "../types/game";

  export type HelperScaling = Pick<PokemonHelper, 'baseCost' | 'baseProduction'| 'count'| 'unlocked'>;

  export const HELPERS_SCALING: HelperScaling[] = [
        // Tier 1 - Starter Pokemon with evolutions
        {
          baseCost: 10,
          baseProduction: 0.5,
          count: 0,
          unlocked: true,
        },
        {
          baseCost: 100,
          baseProduction: 5,
          count: 0,
          unlocked: false,
        },
        {
          baseCost: 1100,
          baseProduction: 50,
          count: 0,
          unlocked: false,
        },
        {
        baseCost: 12000,
          baseProduction: 500,
          count: 0,
          unlocked: false,
        },
       // Tier 2 - Popular Pokemon with evolutions
        {
          baseCost: 130000,
          baseProduction: 5000,
          count: 0,
          unlocked: false,
        },
        {
          baseCost: 1400000,
          baseProduction: 50000,
          count: 0,
          unlocked: false,
        },
        {
          baseCost: 20000000,
          baseProduction: 700000,
          count: 0,
          unlocked: false,
        },
        
        {
          baseCost: 330000000,
          baseProduction: 11000000,
          count: 0,
          unlocked: false,
        },
        {
          baseCost: 5100000000,
          baseProduction: 170000000,
          count: 0,
          unlocked: false,
        },
        {
          baseCost: 75000000000,
          baseProduction: 2500000000,
          count: 0,
          unlocked: false,
        },
        // Tier 3 - Powerful Pokemon with evolutions
        {
          baseCost: 1000000000000,
          baseProduction: 33000000000,
          count: 0,
          unlocked: false,
        },
        {
          baseCost: 14000000000000,
          baseProduction: 460000000000,
          count: 0,
          unlocked: false,
        },
        {
          baseCost: 170000000000000,
          baseProduction: 5600000000000,
          count: 0,
          unlocked: false,
        },
        // Tier 4 - Legendary Pokemon (no evolutions)
        {
          baseCost: 2100000000000000,
          baseProduction: 70000000000000,
          count: 0,
          unlocked: false,
        },
        {
          baseCost: 26000000000000000,
          baseProduction: 860000000000000,
          count: 0,
          unlocked: false,
        },
        {
          baseCost: 330000000000000000,
          baseProduction: 11000000000000000,
          count: 0,
          unlocked: false,
        },
        {
          baseCost: 4100000000000000000,
          baseProduction: 136000000000000000,
          count: 0,
          unlocked: false,
        },
        {
          baseCost: 51000000000000000000,
          baseProduction: 1700000000000000000,
          count: 0,
          unlocked: false,
        },
      ];