import type { GameState, Pokemon } from '../types/pokemon'
import { STAT_LABELS } from '../types/pokemon'

interface GameResultProps {
  gameState: GameState
  totalStats: number
  won: boolean
  difference: number
  onReset: () => void
  onRestartWithSameFilters: () => void
}

// Helper function to get the correct sprite (shiny or normal)
const getPokemonSprite = (pokemon: Pokemon): string => {
  return pokemon.isShiny ? pokemon.sprites.front_shiny : pokemon.sprites.front_default
}

export const GameResult = ({ gameState, totalStats, won, difference, onReset, onRestartWithSameFilters }: GameResultProps) => {
  return (
    <div className="game-result">
      <div className={`result-header ${won ? 'victory' : 'defeat'}`}>
        <h1>{won ? '🎉 Victoire !' : '😢 Défaite'}</h1>
        <p className="result-message">
          {won 
            ? `Vous avez dépassé l'objectif de ${difference} points !`
            : `Il vous manquait ${Math.abs(difference)} points...`
          }
        </p>
      </div>

      <div className="result-stats">
        <div className="total-display">
          <div className="stat-box">
            <span className="stat-label">Votre total</span>
            <span className={`stat-number ${won ? 'success' : 'failure'}`}>
              {totalStats}
            </span>
          </div>
          <div className="stat-separator">vs</div>
          <div className="stat-box">
            <span className="stat-label">Objectif</span>
            <span className="stat-number target">
              {gameState.targetTotal}
            </span>
          </div>
        </div>
      </div>

      <div className="selected-stats-recap">
        <h3>Récapitulatif de vos choix :</h3>
        <div className="stats-list">
          {gameState.selectedStats.map((selection, index) => (
            <div key={index} className="stat-item">
              <div className="stat-item-header">
                <span className="round-number">Manche {index + 1}</span>
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
          🔄 Rejouer avec les mêmes filtres
        </button>
        <button onClick={onReset} className="reset-button">
          ⚙️ Changer les filtres
        </button>
      </div>
    </div>
  )
}