import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { GameState, Pokemon, FilterOptions } from '../types/pokemon'
import { STAT_LABELS } from '../types/pokemon'
import { STAT_ORDER, GAME_CONFIG } from '../config/constants'
import { Leaderboard } from './Leaderboard'
import { LeaderboardService, type Leaderboard as LeaderboardType } from '../services/LeaderboardService'

interface GameResultProps {
  gameState: GameState
  totalStats: number
  won: boolean
  difference: number
  filters: FilterOptions
  onReset: () => void
  onRestartWithSameFilters: () => void
  onRestartWithAdjustedTarget: (adjustment: number) => void
}

// Helper function to get the correct sprite (shiny or normal)
const getPokemonSprite = (pokemon: Pokemon): string => {
  return pokemon.isShiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default
}

const getPokemonName = (pokemon: Pokemon, language: string): string => {
  if (pokemon.names) {
    return language.startsWith('fr') ? pokemon.names.fr : pokemon.names.en;
  }
  return pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
}

export const GameResult = ({ gameState, totalStats, won, difference, filters, onReset, onRestartWithSameFilters, onRestartWithAdjustedTarget }: GameResultProps) => {
  const { t, i18n } = useTranslation()
  const [leaderboard, setLeaderboard] = useState<LeaderboardType | null>(null)
  const scoreSavedRef = useRef(false)

  const handleClearLeaderboard = () => {
    if (window.confirm(t('result.confirmClear'))) {
      LeaderboardService.clearLeaderboard(filters)
      setLeaderboard(null)
    }
  }

  useEffect(() => {
    if (won) {
      if (!scoreSavedRef.current) {
        // Save score and get updated leaderboard
        const updatedLeaderboard = LeaderboardService.saveScore(filters, totalStats, GAME_CONFIG.ROUNDS_PER_GAME)
        setLeaderboard(updatedLeaderboard)
        scoreSavedRef.current = true
      }
    } else {
      // Just get existing leaderboard
      const existingLeaderboard = LeaderboardService.getLeaderboard(filters)
      setLeaderboard(existingLeaderboard)
    }
  }, [won, totalStats, filters])

  return (
    <div className="game-result-container">
    <div className="game-result-compact">
      <div className={`result-header-compact ${won ? 'victory' : 'defeat'}`}>
        <div className="result-title-row">
          <h1>{won ? t('result.victory') : t('result.defeat')}</h1>
          <div className="total-display-compact">
            <div className="stat-box-compact">
              <span className="stat-label-compact">{t('result.yourTotal')}</span>
              <span className={`stat-number-compact ${won ? 'success' : 'failure'}`}>
                {totalStats}
              </span>
            </div>
            <div className="stat-separator-compact">vs</div>
            <div className="stat-box-compact">
              <span className="stat-label-compact">{t('result.target')}</span>
              <span className="stat-number-compact target">
                {gameState.targetTotal}
              </span>
            </div>
          </div>
        </div>
        <p className="result-message-compact">
          {won
            ? t('result.wonMessage', { difference })
            : t('result.lostMessage', { difference: Math.abs(difference) })
          }
        </p>
      </div>

      <div className="selected-stats-recap-compact">
        <div className="stats-list-compact">
          {[...gameState.selectedStats]
            .sort((a, b) => STAT_ORDER.indexOf(a.statName) - STAT_ORDER.indexOf(b.statName))
            .map((selection, index) => (
              <div key={index} className="stat-item-compact">
                <div className="stat-item-content-compact">
                  <img
                    src={getPokemonSprite(selection.pokemon)}
                    alt={getPokemonName(selection.pokemon, i18n.language)}
                    className="mini-sprite-compact"
                  />
                  <div className="stat-detail-compact">
                    <div className="pokemon-name-compact">
                      {getPokemonName(selection.pokemon, i18n.language)}
                    </div>
                    <div className="stat-info-compact">
                      <span className="stat-name-compact">
                        {STAT_LABELS[selection.statName]}
                        {selection.pokemon.isShiny && <span className="shiny-indicator">✨</span>}
                      </span>
                      <span className="stat-value-compact">{selection.value}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="result-buttons-compact">
        <button onClick={onRestartWithSameFilters} className="restart-same-button-compact">
          {t('result.replay')}
        </button>
        {won ? (
          <>
            <button onClick={() => onRestartWithAdjustedTarget(GAME_CONFIG.TARGET_STEP)} className="adjust-button-compact adjust-up">
              ⬆️ +{GAME_CONFIG.TARGET_STEP}
            </button>
            <button onClick={() => onRestartWithAdjustedTarget(GAME_CONFIG.TARGET_STEP * 2)} className="adjust-button-compact adjust-up">
              ⬆️ +{GAME_CONFIG.TARGET_STEP * 2}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onRestartWithAdjustedTarget(-GAME_CONFIG.TARGET_STEP)} className="adjust-button-compact adjust-down">
              ⬇️ -{GAME_CONFIG.TARGET_STEP}
            </button>
            <button onClick={() => onRestartWithAdjustedTarget(-GAME_CONFIG.TARGET_STEP * 2)} className="adjust-button-compact adjust-down">
              ⬇️ -{GAME_CONFIG.TARGET_STEP * 2}
            </button>
          </>
        )}
        <button onClick={onReset} className="reset-button-compact">
          {t('result.config')}
        </button>
      </div>
    </div>
    
    <div className="game-result-sidebar">
      <Leaderboard
        leaderboard={leaderboard}
        currentScore={won ? totalStats : undefined}
        onClear={handleClearLeaderboard}
      />
    </div>
    </div>
  )
}