import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePokeGame } from './hooks/usePokeGame'
import { GameSetup } from './components/GameSetup'
import { PokemonCard } from './components/PokemonCard'
import { GameResult } from './components/GameResult'
import { GameConfig } from './components/GameConfig'
import { WelcomePopup } from './components/WelcomePopup'
import { GAME_CONFIG, GAME_PHASES } from './config/constants'
import './styles/game.css'

export const PokeStatsGame = () => {
  const { t } = useTranslation()
  const [showWelcome, setShowWelcome] = useState(false)
  const {
    gameState,
    loading,
    filters,
    skipConfirmation,
    shinyBonus,
    startGame,
    drawPokemon,
    selectStatName,
    resetGame,
    restartWithSameFilters,
    restartWithAdjustedTarget,
    calculateResult,
    updateSkipConfirmation,
    updateShinyBonus,
    poolError
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

  // Listen for reset event from Navbar
  useEffect(() => {
    const handleReset = () => {
      resetGame()
    }
    window.addEventListener('pokestats-reset', handleReset)
    return () => window.removeEventListener('pokestats-reset', handleReset)
  }, [resetGame])

  return (
    <div className="pokestats-game">
      <WelcomePopup forceShow={showWelcome} onClose={() => setShowWelcome(false)} />
      
      <div className="top-controls">
        <button
          className="help-button"
          onClick={() => setShowWelcome(true)}
          title={t('app.help')}
        >
          ?
        </button>
      </div>

      {gameState.phase === GAME_PHASES.SETUP && (
        <GameSetup onStart={startGame} poolError={poolError} />
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
        <div className="header-content">
          <div className="header-left">
            <h1>{t('app.title')}</h1>
            <div className="round-badge">
              <span className="round-label">{t('gameProgress.round')}</span>
              <span className="round-value">{gameState.selectedStats.length} / {GAME_CONFIG.ROUNDS_PER_GAME}</span>
            </div>
          </div>

          <div className="game-hud">
            <div className="hud-card target-card">
              <span className="hud-label">{t('gameProgress.target')}</span>
              <span className="hud-value">{gameState.targetTotal}</span>
            </div>

            <div className="hud-card total-card">
              <span className="hud-label">{t('gameProgress.total')}</span>
              <span className="hud-value highlight">
                {gameState.selectedStats.reduce((sum, s) => sum + s.value, 0)}
              </span>
            </div>

            <div className="hud-card filters-card filter-info-container">
              <span className="hud-label">{t('gameProgress.filters')}</span>
              <div className="filters-preview">
                <span className="filter-summary">
                  {filters.generations && filters.generations.length > 0 ? t('gameProgress.gen', { generations: filters.generations.join(', ') }) : t('gameProgress.allGen')}
                </span>
                {filters.types && filters.types.length > 0 && (
                  <span className="filter-tag">
                    {t('gameProgress.types', { count: filters.types.length }).replace('• ', '')}
                  </span>
                )}
                {(filters.legendary || filters.mythical || filters.ultraBeast || filters.paradox || filters.mega || filters.gigantamax || filters.legendsZA || (filters.regionalForms && filters.regionalForms.length > 0)) && (
                  <span className="filter-tag special">
                    {t('gameProgress.special').replace('• ', '')}
                  </span>
                )}
              </div>
              
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
          </div>
        </div>
        
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(100, (gameState.selectedStats.reduce((sum, s) => sum + s.value, 0) / gameState.targetTotal) * 100)}%`
            }}
          />
          <div
            className="progress-bar-target-marker"
            style={{ left: '100%' }}
            title={t('gameProgress.target')}
          />
        </div>
      </div>

          {(loading || gameState.currentPokemon || (gameState.statsRevealed && gameState.selectedStats.length > 0)) && (
            <>
              <PokemonCard
                pokemon={gameState.statsRevealed && !gameState.currentPokemon
                  ? gameState.selectedStats[gameState.selectedStats.length - 1].pokemon
                  : gameState.currentPokemon}
                availableStats={gameState.availableStats}
                selectedStatName={gameState.statsRevealed && !gameState.currentPokemon
                  ? gameState.selectedStats[gameState.selectedStats.length - 1].statName
                  : gameState.selectedStatName}
                statsRevealed={gameState.statsRevealed && !gameState.currentPokemon}
                onSelectStatName={selectStatName}
                round={gameState.currentRound}
                selectedStats={gameState.selectedStats}
                isLoading={loading}
              />
              {gameState.statsRevealed && !gameState.currentPokemon && !loading && (
                <p className="next-round-message">{t('app.nextRound')}</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}