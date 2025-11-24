import { useEffect } from 'react'
import { usePokeGame } from './hooks/usePokeGame'
import { GameSetup } from './components/GameSetup'
import { PokemonCard } from './components/PokemonCard'
import { GameResult } from './components/GameResult'
import './App.css'

function App() {
  const {
    gameState,
    loading,
    startGame,
    drawPokemon,
    selectStatName,
    confirmSelection,
    resetGame,
    restartWithSameFilters,
    calculateResult
  } = usePokeGame()

  // Auto-draw Pokemon when starting a new round
  useEffect(() => {
    if (gameState.phase === 'playing' && !gameState.currentPokemon && !loading) {
      drawPokemon()
    }
  }, [gameState.phase, gameState.currentPokemon, loading, drawPokemon])

  // Auto-draw next Pokemon after revealing stats
  useEffect(() => {
    if (gameState.phase === 'playing' && gameState.statsRevealed && !gameState.currentPokemon) {
      const timer = setTimeout(() => {
        drawPokemon()
      }, 3000) // Wait 3 seconds before drawing next Pokemon
      return () => clearTimeout(timer)
    }
  }, [gameState.phase, gameState.statsRevealed, gameState.currentPokemon, drawPokemon])

  if (gameState.phase === 'setup') {
    return (
      <div className="app">
        <GameSetup onStart={startGame} />
      </div>
    )
  }

  if (gameState.phase === 'result') {
    const result = calculateResult()
    return (
      <div className="app">
        <GameResult
          gameState={gameState}
          totalStats={result.totalStats}
          won={result.won}
          difference={result.difference}
          onReset={resetGame}
          onRestartWithSameFilters={restartWithSameFilters}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="game-header">
        <h1>PokéStats Challenge</h1>
        <div className="game-progress">
          <div className="progress-info">
            <span>Objectif : {gameState.targetTotal}</span>
            <span>Stats sélectionnées : {gameState.selectedStats.length} / 6</span>
          </div>
          <div className="current-total">
            Total actuel : {gameState.selectedStats.reduce((sum, s) => sum + s.value, 0)}
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="pokeball-loader"></div>
          <p>Tirage d'un Pokémon...</p>
        </div>
      )}

      {!loading && (gameState.currentPokemon || (gameState.statsRevealed && gameState.selectedStats.length > 0)) && (
        <>
          <PokemonCard
            pokemon={gameState.statsRevealed && !gameState.currentPokemon
              ? gameState.selectedStats[gameState.selectedStats.length - 1].pokemon
              : gameState.currentPokemon!}
            availableStats={gameState.availableStats}
            selectedStatName={gameState.statsRevealed && !gameState.currentPokemon
              ? gameState.selectedStats[gameState.selectedStats.length - 1].statName
              : gameState.selectedStatName}
            statsRevealed={gameState.statsRevealed && !gameState.currentPokemon}
            onSelectStatName={selectStatName}
            onConfirmSelection={confirmSelection}
            round={gameState.currentRound}
            selectedStats={gameState.selectedStats}
          />
          {gameState.statsRevealed && !gameState.currentPokemon && (
            <p className="next-round-message">Prochain Pokémon dans quelques secondes...</p>
          )}
        </>
      )}
    </div>
  )
}

export default App
