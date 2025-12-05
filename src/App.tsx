import { useEffect } from 'react'
import { usePokeGame } from './hooks/usePokeGame'
import { GameSetup } from './components/GameSetup'
import { PokemonCard } from './components/PokemonCard'
import { GameResult } from './components/GameResult'
import { GameConfig } from './components/GameConfig'
import { GAME_CONFIG, GAME_PHASES } from './config/constants'
import './App.css'

function App() {
  const {
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
    updateSkipConfirmation,
    updateShinyBonus
  } = usePokeGame()

  // Auto-draw Pokemon when starting a new round
  useEffect(() => {
    if (gameState.phase === GAME_PHASES.PLAYING && !gameState.currentPokemon && !loading) {
      drawPokemon()
    }
  }, [gameState.phase, gameState.currentPokemon, loading, drawPokemon])

  // Auto-draw next Pokemon after revealing stats
  useEffect(() => {
    if (gameState.phase === GAME_PHASES.PLAYING && gameState.statsRevealed && !gameState.currentPokemon) {
      const timer = setTimeout(() => {
        drawPokemon()
      }, GAME_CONFIG.AUTO_DRAW_DELAY)
      return () => clearTimeout(timer)
    }
  }, [gameState.phase, gameState.statsRevealed, gameState.currentPokemon, drawPokemon])

  return (
    <div className="app">
      <button onClick={resetGame} className="home-button" title="Retour à l'accueil">
        🏠 Home
      </button>
      
      <GameConfig
        skipConfirmation={skipConfirmation}
        shinyBonus={shinyBonus}
        onSkipConfirmationChange={updateSkipConfirmation}
        onShinyBonusChange={updateShinyBonus}
      />
      
      {gameState.phase === GAME_PHASES.SETUP && (
        <GameSetup onStart={startGame} />
      )}

      {gameState.phase === GAME_PHASES.RESULT && (() => {
        const result = calculateResult()
        return (
          <GameResult
            gameState={gameState}
            totalStats={result.totalStats}
            won={result.won}
            difference={result.difference}
            filters={filters}
            onReset={resetGame}
            onRestartWithSameFilters={restartWithSameFilters}
            onRestartWithAdjustedTarget={restartWithAdjustedTarget}
          />
        )
      })()}

      {gameState.phase === GAME_PHASES.PLAYING && (
        <>
      <div className="game-header">
        <h1>PokéStats Challenge</h1>
        <div className="game-progress">
          <div className="progress-info">
            <div className="info-item">
              <span className="label">Objectif :</span>
              <span className="value">{gameState.targetTotal}</span>
            </div>
            <div className="info-item filter-info-container">
              <span className="label">Filtres :</span>
              <span className="value">
                {filters.generations && filters.generations.length > 0 ? `Gen ${filters.generations.join(', ')}` : 'Toutes Gen'}
                {filters.types && filters.types.length > 0 ? ` • ${filters.types.length} Types` : ''}
                {(filters.legendary || filters.mythical || filters.ultraBeast || filters.paradox || filters.mega || filters.gigantamax || filters.legendsZA || (filters.regionalForms && filters.regionalForms.length > 0)) ? ' • Spéciaux' : ''}
                {filters.filterMode === 'AND' ? ' (Restrictif)' : ' (Additif)'}
              </span>
              
              <div className="filter-tooltip">
                <div className="tooltip-row">
                  <span className="tooltip-label">Mode :</span>
                  <span className="tooltip-value">{filters.filterMode === 'AND' ? 'Restrictif (ET)' : 'Additif (OU)'}</span>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-label">Générations :</span>
                  <span className="tooltip-value">{filters.generations && filters.generations.length > 0 ? filters.generations.join(', ') : 'Toutes'}</span>
                </div>
                {filters.types && filters.types.length > 0 && (
                  <div className="tooltip-row">
                    <span className="tooltip-label">Types :</span>
                    <div className="tooltip-types">
                      {filters.types.map(t => (
                        <span key={t} className={`mini-type-tag type-${t}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(filters.legendary || filters.mythical || filters.ultraBeast || filters.paradox || filters.mega || filters.gigantamax || filters.legendsZA || (filters.regionalForms && filters.regionalForms.length > 0)) && (
                  <div className="tooltip-row">
                    <span className="tooltip-label">Spécial :</span>
                    <span className="tooltip-value">
                      {[
                        filters.legendary && 'Légendaires',
                        filters.mythical && 'Fabuleux',
                        filters.ultraBeast && 'Ultra-Chimères',
                        filters.paradox && 'Paradoxes',
                        filters.mega && 'Méga',
                        filters.gigantamax && 'Gigamax',
                        filters.legendsZA && 'Légendes Z-A',
                        filters.regionalForms && filters.regionalForms.length > 0 && `Formes (${filters.regionalForms.join(', ')})`
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="info-item">
              <span className="label">Manche :</span>
              <span className="value">{gameState.selectedStats.length} / {GAME_CONFIG.ROUNDS_PER_GAME}</span>
            </div>
          </div>
          <div className="current-total">
            Total : {gameState.selectedStats.reduce((sum, s) => sum + s.value, 0)}
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
                skipConfirmation={skipConfirmation}
              />
              {gameState.statsRevealed && !gameState.currentPokemon && (
                <p className="next-round-message">Prochain Pokémon dans quelques secondes...</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default App
