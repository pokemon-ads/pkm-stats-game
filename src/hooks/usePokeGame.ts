import { useState, useCallback } from 'react'
import * as PokeAPI from 'pokeapi-js-wrapper'
import type { GameState, Pokemon, StatName, FilterOptions, PokemonSpecies } from '../types/pokemon'
import { REGIONS, GENERATIONS, LEGENDARY_IDS, MYTHICAL_IDS, MEGA_EVOLUTION_IDS, GIGANTAMAX_IDS, ULTRA_BEAST_IDS, LEGENDS_ZA_MEGA_IDS, MEGA_FORMS, GIGANTAMAX_FORMS, ALOLA_FORM_IDS, GALAR_FORM_IDS, HISUI_FORM_IDS, PALDEA_FORM_IDS, REGIONAL_FORMS } from '../types/pokemon'

const P = new PokeAPI.Pokedex()

export const usePokeGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'setup',
    targetTotal: 600,
    currentRound: 0,
    selectedStats: [],
    currentPokemon: null,
    availableStats: ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'],
    selectedStatName: null,
    statsRevealed: false
  })

  const [filters, setFilters] = useState<FilterOptions>({})
  const [pokemonPool, setPokemonPool] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  // Generate Pokemon pool based on filters
  const generatePokemonPool = useCallback(async (filterOptions: FilterOptions) => {
    let pool: number[] = []

    // Priority: Generation > Region > All Pokemon
    if (filterOptions.generation && GENERATIONS[filterOptions.generation as keyof typeof GENERATIONS]) {
      const generation = GENERATIONS[filterOptions.generation as keyof typeof GENERATIONS]
      pool = Array.from(
        { length: generation.range[1] - generation.range[0] + 1 },
        (_, i) => generation.range[0] + i
      )
    } else if (filterOptions.region && REGIONS[filterOptions.region as keyof typeof REGIONS]) {
      const region = REGIONS[filterOptions.region as keyof typeof REGIONS]
      pool = Array.from(
        { length: region.range[1] - region.range[0] + 1 },
        (_, i) => region.range[0] + i
      )
    } else {
      // All Pokemon (Gen 1-9)
      pool = Array.from({ length: 1025 }, (_, i) => i + 1)
    }

    // Apply type filter FIRST by fetching from API
    if (filterOptions.type) {
      try {
        const typeData = await P.getTypeByName(filterOptions.type) as any
        const typePokemonIds = typeData.pokemon
          .map((p: any) => {
            const urlParts = p.pokemon.url.split('/')
            return parseInt(urlParts[urlParts.length - 2])
          })
          .filter((id: number) => id <= 1025) // Only Gen 1-9
        
        // Intersect with current pool
        pool = pool.filter(id => typePokemonIds.includes(id))
      } catch (error) {
        console.error('Error fetching type data:', error)
      }
    }

    // Apply legendary filter
    if (filterOptions.legendary) {
      pool = pool.filter(id => LEGENDARY_IDS.includes(id))
    }

    // Apply mythical filter
    if (filterOptions.mythical) {
      pool = pool.filter(id => MYTHICAL_IDS.includes(id))
    }

    // Apply mega evolution filter
    if (filterOptions.mega) {
      pool = pool.filter(id => MEGA_EVOLUTION_IDS.includes(id))
    }

    // Apply gigantamax filter
    if (filterOptions.gigantamax) {
      pool = pool.filter(id => GIGANTAMAX_IDS.includes(id))
    }

    // Apply ultra beast filter
    if (filterOptions.ultraBeast) {
      pool = pool.filter(id => ULTRA_BEAST_IDS.includes(id))
    }

    // Apply Legends Z-A mega filter
    if (filterOptions.legendsZA) {
      pool = pool.filter(id => LEGENDS_ZA_MEGA_IDS.includes(id))
    }

    // Apply regional form filter
    if (filterOptions.regionalForm) {
      const formIds = {
        alola: ALOLA_FORM_IDS,
        galar: GALAR_FORM_IDS,
        hisui: HISUI_FORM_IDS,
        paldea: PALDEA_FORM_IDS
      }[filterOptions.regionalForm]
      
      pool = pool.filter(id => formIds.includes(id))
    }

    return pool
  }, [])

  // Fetch special form (regional, mega evolution or gigantamax) if needed
  const fetchPokemonForm = useCallback(async (baseId: number, useMega: boolean, useGigantamax: boolean, regionalForm?: string): Promise<Pokemon> => {
    // Priority: Regional Form > Gigantamax > Mega > Base form
    
    // Try Regional form if specified
    if (regionalForm && REGIONAL_FORMS[regionalForm]) {
      const regionalForms = REGIONAL_FORMS[regionalForm][baseId]
      if (regionalForms && regionalForms.length > 0) {
        try {
          // If multiple regional forms, pick one randomly
          const formName = regionalForms[Math.floor(Math.random() * regionalForms.length)]
          return await P.getPokemonByName(formName) as Pokemon
        } catch (error) {
          console.error('Error fetching regional form, trying next priority:', error)
        }
      }
    }
    
    // Try Gigantamax form
    if (useGigantamax && GIGANTAMAX_FORMS[baseId]) {
      try {
        return await P.getPokemonByName(GIGANTAMAX_FORMS[baseId]) as Pokemon
      } catch (error) {
        console.error('Error fetching Gigantamax form, trying base form:', error)
        return await P.getPokemonByName(baseId) as Pokemon
      }
    }
    
    // Try Mega form
    if (useMega && MEGA_FORMS[baseId]) {
      // Get mega form(s)
      const megaForms = MEGA_FORMS[baseId]
      // If multiple mega forms, pick one randomly
      const megaForm = megaForms[Math.floor(Math.random() * megaForms.length)]
      
      try {
        return await P.getPokemonByName(megaForm) as Pokemon
      } catch (error) {
        console.error('Error fetching mega form, using base form:', error)
        return await P.getPokemonByName(baseId) as Pokemon
      }
    }
    
    return await P.getPokemonByName(baseId) as Pokemon
  }, [])

  // Start game with filters
  const startGame = useCallback(async (targetTotal: number, filterOptions: FilterOptions) => {
    setLoading(true)
    const pool = await generatePokemonPool(filterOptions)
    setPokemonPool(pool)
    setFilters(filterOptions)
    
    setGameState({
      phase: 'playing',
      targetTotal,
      currentRound: 0,
      selectedStats: [],
      currentPokemon: null,
      availableStats: ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'],
      selectedStatName: null,
      statsRevealed: false
    })
    
    setLoading(false)
  }, [generatePokemonPool])

  // Draw a random Pokemon from the pool
  const drawPokemon = useCallback(async () => {
    if (pokemonPool.length === 0) return

    setLoading(true)
    let attempts = 0
    const maxAttempts = 50

    while (attempts < maxAttempts) {
      try {
        const randomId = pokemonPool[Math.floor(Math.random() * pokemonPool.length)]
        const pokemon = await fetchPokemonForm(
          randomId,
          !!(filters.mega || filters.legendsZA),
          !!filters.gigantamax,
          filters.regionalForm
        )
        
        // Determine if this Pokemon is shiny (1/512 chance)
        const isShiny = Math.random() < 1/512
        const pokemonWithShiny = {
          ...pokemon,
          isShiny
        } as Pokemon
        
        setGameState(prev => ({
          ...prev,
          currentPokemon: pokemonWithShiny,
          currentRound: prev.currentRound + 1,
          selectedStatName: null,
          statsRevealed: false
        }))
        setLoading(false)
        return
      } catch (error) {
        console.error('Error fetching Pokemon:', error)
      }
      attempts++
    }
    
    // If we couldn't find a matching Pokemon after max attempts, try again
    setLoading(false)
    console.warn('Could not find matching Pokemon, retrying...')
    setTimeout(() => drawPokemon(), 1000)
  }, [pokemonPool, filters.mega, filters.legendsZA, filters.gigantamax, fetchPokemonForm])

  // Select a stat (without revealing value)
  const selectStatName = useCallback((statName: StatName) => {
    setGameState(prev => ({
      ...prev,
      selectedStatName: statName
    }))
  }, [])

  // Confirm selection and reveal the value
  const confirmSelection = useCallback(() => {
    if (!gameState.currentPokemon || !gameState.selectedStatName) return

    const statData = gameState.currentPokemon.stats.find(
      s => s.stat.name === gameState.selectedStatName
    )
    
    if (!statData) return

    const newSelectedStats = [
      ...gameState.selectedStats,
      {
        pokemon: gameState.currentPokemon,
        statName: gameState.selectedStatName,
        value: statData.base_stat
      }
    ]

    const newAvailableStats = gameState.availableStats.filter(s => s !== gameState.selectedStatName)

    if (newSelectedStats.length === 6) {
      // Game over - calculate result
      setGameState(prev => ({
        ...prev,
        phase: 'result',
        selectedStats: newSelectedStats,
        availableStats: newAvailableStats,
        statsRevealed: true
      }))
    } else {
      // Continue to next round
      setGameState(prev => ({
        ...prev,
        selectedStats: newSelectedStats,
        currentPokemon: null,
        availableStats: newAvailableStats,
        selectedStatName: null,
        statsRevealed: true
      }))
    }
  }, [gameState])

  // Reset game
  const resetGame = useCallback(() => {
    setGameState({
      phase: 'setup',
      targetTotal: 600,
      currentRound: 0,
      selectedStats: [],
      currentPokemon: null,
      availableStats: ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'],
      selectedStatName: null,
      statsRevealed: false
    })
    setPokemonPool([])
    setFilters({})
  }, [])

  // Restart game with same filters and target
  const restartWithSameFilters = useCallback(() => {
    startGame(gameState.targetTotal, filters)
  }, [gameState.targetTotal, filters, startGame])

  // Calculate if player won
  const calculateResult = useCallback(() => {
    const totalStats = gameState.selectedStats.reduce((sum, stat) => sum + stat.value, 0)
    return {
      totalStats,
      targetTotal: gameState.targetTotal,
      won: totalStats >= gameState.targetTotal,
      difference: totalStats - gameState.targetTotal
    }
  }, [gameState])

  return {
    gameState,
    loading,
    filters,
    startGame,
    drawPokemon,
    selectStatName,
    confirmSelection,
    resetGame,
    restartWithSameFilters,
    calculateResult,
    setFilters
  }
}