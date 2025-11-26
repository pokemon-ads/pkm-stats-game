import type { GameState, Pokemon, StatName } from '../types/pokemon'
import { STAT_LABELS } from '../types/pokemon'
import { STAT_ORDER, GAME_CONFIG } from '../config/constants'

interface GameResultProps {
  gameState: GameState
  totalStats: number
  won: boolean
  difference: number
  onReset: () => void
  onRestartWithSameFilters: () => void
  onRestartWithAdjustedTarget: (adjustment: number) => void
}

// Helper function to get the correct sprite (shiny or normal)
const getPokemonSprite = (pokemon: Pokemon): string => {
  return pokemon.isShiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default
}

export const GameResult = ({ gameState, totalStats, won, difference, onReset, onRestartWithSameFilters, onRestartWithAdjustedTarget }: GameResultProps) => {
  return (
    <div className="game-result">
      <div className={`result-header-compact ${won ? 'victory' : 'defeat'}`}>
        <div className="result-title-row">
          <h1>{won ? '🎉 Victoire !' : '😢 Défaite'}</h1>
          <div className="total-display-compact">
            <div className="stat-box-compact">
              <span className="stat-label-compact">Votre total</span>
              <span className={`stat-number-compact ${won ? 'success' : 'failure'}`}>
                {totalStats}
              </span>
            </div>
            <div className="stat-separator-compact">vs</div>
            <div className="stat-box-compact">
              <span className="stat-label-compact">Objectif</span>
              <span className="stat-number-compact target">
                {gameState.targetTotal}
              </span>
            </div>
          </div>
        </div>
        <p className="result-message-compact">
          {won
            ? `Vous avez dépassé l'objectif de ${difference} points !`
            : `Il vous manquait ${Math.abs(difference)} points...`
          }
        </p>
      </div>

      <div className="selected-stats-recap">
        <h3>Récapitulatif de vos choix :</h3>
        <div className="stats-list">
          {[...gameState.selectedStats]
            .sort((a, b) => STAT_ORDER.indexOf(a.statName) - STAT_ORDER.indexOf(b.statName))
            .map((selection, index) => (
              <div key={index} className="stat-item">
                <div className="stat-item-header">
                  <span className="round-number">Manche {gameState.selectedStats.indexOf(selection) + 1}</span>
                  <span className="pokemon-name">
                    {selection.pokemon.name.charAt(0).toUpperCase() + selection.pokemon.name.slice(1)}
                  </span>
                </div>
                <div className="stat-item-content">
                  <img
                    src={getPokemonSprite(selection.pokemon)}
                    alt={selection.pokemon.name}
                    className="mini-sprite"
                  />
                  <div className="stat-detail">
                    <span className="stat-name">
                      {STAT_LABELS[selection.statName]}
                      {selection.pokemon.isShiny && <span className="shiny-indicator">✨</span>}
                    </span>
                    <span className="stat-value">{selection.value}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="result-buttons">
        <button onClick={onRestartWithSameFilters} className="restart-same-button">
          🔄 Rejouer (même objectif)
        </button>
        {won ? (
          <>
            <button onClick={() => onRestartWithAdjustedTarget(GAME_CONFIG.TARGET_STEP)} className="adjust-button adjust-up">
              ⬆️ Rejouer (+{GAME_CONFIG.TARGET_STEP})
            </button>
            <button onClick={() => onRestartWithAdjustedTarget(GAME_CONFIG.TARGET_STEP * 2)} className="adjust-button adjust-up">
              ⬆️⬆️ Rejouer (+{GAME_CONFIG.TARGET_STEP * 2})
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onRestartWithAdjustedTarget(-GAME_CONFIG.TARGET_STEP)} className="adjust-button adjust-down">
              ⬇️ Rejouer (-{GAME_CONFIG.TARGET_STEP})
            </button>
            <button onClick={() => onRestartWithAdjustedTarget(-GAME_CONFIG.TARGET_STEP * 2)} className="adjust-button adjust-down">
              ⬇️⬇️ Rejouer (-{GAME_CONFIG.TARGET_STEP * 2})
            </button>
          </>
        )}
        <button onClick={onReset} className="reset-button">
          ⚙️ Changer les filtres
        </button>
      </div>
    </div>
  )
}