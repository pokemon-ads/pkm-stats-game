import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePokeGame } from './hooks/usePokeGame'
import { GameSetup } from './components/GameSetup'
import { PokemonCard } from './components/PokemonCard'
import { GameResult } from './components/GameResult'
import { GameConfig } from './components/GameConfig'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { WelcomePopup } from './components/WelcomePopup'
import { GAME_CONFIG, GAME_PHASES } from './config/constants'
import './App.css'

function App() {
  const { t } = useTranslation()
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
      <WelcomePopup />
      <LanguageSwitcher />
      <button onClick={resetGame} className="home-button" title={t('app.homeButton')}>
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
        <h1>{t('app.title')}</h1>
        <div className="game-progress">
          <div className="progress-info">
            <div className="info-item">
              <span className="label">{t('gameProgress.target')}</span>
              <span className="value">{gameState.targetTotal}</span>
            </div>
            <div className="info-item filter-info-container">
              <span className="label">{t('gameProgress.filters')}</span>
              <span className="value">
                {filters.generations && filters.generations.length > 0 ? t('gameProgress.gen', { generations: filters.generations.join(', ') }) : t('gameProgress.allGen')}
                {filters.types && filters.types.length > 0 ? ` ${t('gameProgress.types', { count: filters.types.length })}` : ''}
                {(filters.legendary || filters.mythical || filters.ultraBeast || filters.paradox || filters.mega || filters.gigantamax || filters.legendsZA || (filters.regionalForms && filters.regionalForms.length > 0)) ? ` ${t('gameProgress.special')}` : ''}
                {filters.filterMode === 'AND' ? ` ${t('gameProgress.restrictive')}` : ` ${t('gameProgress.additive')}`}
              </span>
              
              <div className="filter-tooltip">
                <div className="tooltip-row">
                  <span className="tooltip-label">{t('tooltip.mode')}</span>
                  <span className="tooltip-value">{filters.filterMode === 'AND' ? t('tooltip.modeRestrictive') : t('tooltip.modeAdditive')}</span>
                </div>
                <div className="tooltip-row">
                  <span className="tooltip-label">{t('tooltip.generations')}</span>
                  <span className="tooltip-value">{filters.generations && filters.generations.length > 0 ? filters.generations.join(', ') : t('tooltip.all')}</span>
                </div>
                {filters.types && filters.types.length > 0 && (
                  <div className="tooltip-row">
                    <span className="tooltip-label">{t('tooltip.types')}</span>
                    <div className="tooltip-types">
                      {filters.types.map(t => (
                        <span key={t} className={`mini-type-tag type-${t}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(filters.legendary || filters.mythical || filters.ultraBeast || filters.paradox || filters.mega || filters.gigantamax || filters.legendsZA || (filters.regionalForms && filters.regionalForms.length > 0)) && (
                  <div className="tooltip-row">
                    <span className="tooltip-label">{t('tooltip.special')}</span>
                    <span className="tooltip-value">
                      {[
                        filters.legendary && t('tooltip.legendary'),
                        filters.mythical && t('tooltip.mythical'),
                        filters.ultraBeast && t('tooltip.ultraBeast'),
                        filters.paradox && t('tooltip.paradox'),
                        filters.mega && t('tooltip.mega'),
                        filters.gigantamax && t('tooltip.gigantamax'),
                        filters.legendsZA && t('tooltip.legendsZA'),
                        filters.regionalForms && filters.regionalForms.length > 0 && t('tooltip.forms', { forms: filters.regionalForms.join(', ') })
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="info-item">
              <span className="label">{t('gameProgress.round')}</span>
              <span className="value">{gameState.selectedStats.length} / {GAME_CONFIG.ROUNDS_PER_GAME}</span>
            </div>
          </div>
          <div className="current-total">
            {t('gameProgress.total')} {gameState.selectedStats.reduce((sum, s) => sum + s.value, 0)}
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="pokeball-loader"></div>
          <p>{t('app.loading')}</p>
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
                <p className="next-round-message">{t('app.nextRound')}</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default App
