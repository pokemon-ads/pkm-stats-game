import { useEffect, useState, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Pokemon, PokemonStats } from '../../../types/pokemon'
import type { GameState, FilterOptions } from '../types/game'
import { STAT_LABELS } from '../../../types/pokemon'
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

  // Calculate theoretical max score using backtracking (Assignment Problem)
  const maxPossibleResult = useMemo(() => {
    const pokemons = gameState.selectedStats.map(s => s.pokemon)
    const stats = STAT_ORDER
    let maxScore = 0
    let bestAssignment: { pokemonIndex: number, statName: string, value: number }[] = []
    const usedStats = new Set<string>()
    const currentAssignment: { pokemonIndex: number, statName: string, value: number }[] = []

    function backtrack(pokemonIndex: number, currentScore: number) {
      if (pokemonIndex === pokemons.length) {
        if (currentScore > maxScore) {
          maxScore = currentScore
          bestAssignment = [...currentAssignment]
        }
        return
      }

      const pokemon = pokemons[pokemonIndex]
      const multiplier = pokemon.isShiny ? 2 : 1

      for (const statName of stats) {
        if (!usedStats.has(statName)) {
          const statValue = pokemon.stats.find(s => s.stat.name === statName)?.base_stat || 0
          
          usedStats.add(statName)
          currentAssignment.push({ pokemonIndex, statName, value: statValue * multiplier })
          
          backtrack(pokemonIndex + 1, currentScore + (statValue * multiplier))
          
          currentAssignment.pop()
          usedStats.delete(statName)
        }
      }
    }

    backtrack(0, 0)
    return { score: maxScore, assignment: bestAssignment }
  }, [gameState.selectedStats])

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
          <div className="max-possible-score">
            <span className="label">{t('result.maxPossible')}</span>
            <span className="value">{maxPossibleResult.score}</span>
            
            <div className="max-score-tooltip">
              <h5>{t('result.optimalStrategy')}</h5>
              <p className="tooltip-desc">{t('result.maxPossibleTooltip')}</p>
              <div className="strategy-list">
                {maxPossibleResult.assignment
                  .sort((a, b) => STAT_ORDER.indexOf(a.statName as keyof PokemonStats) - STAT_ORDER.indexOf(b.statName as keyof PokemonStats))
                  .map((item, idx) => (
                  <div key={idx} className="strategy-row">
                    <span className="strategy-stat">{STAT_LABELS[item.statName as keyof PokemonStats]}</span>
                    <span className="strategy-arrow">→</span>
                    <span className="strategy-pokemon">
                      {getPokemonName(gameState.selectedStats[item.pokemonIndex].pokemon, i18n.language)}
                    </span>
                    <span className="strategy-value">({item.value})</span>
                  </div>
                ))}
              </div>
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
                    
                    <div className="all-stats-tooltip">
                      <h5>{t('pokemonCard.allStats')}</h5>
                      <div className="all-stats-grid">
                        {selection.pokemon.stats.map((stat) => (
                          <div key={stat.stat.name} className={`stat-row ${stat.base_stat === Math.max(...selection.pokemon.stats.map(s => s.base_stat)) ? 'max-stat' : ''}`}>
                            <span className="stat-label">{STAT_LABELS[stat.stat.name]}</span>
                            <span className="stat-val">{stat.base_stat * (selection.pokemon.isShiny ? 2 : 1)}</span>
                          </div>
                        ))}
                      </div>
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