import { useTranslation } from 'react-i18next'
import type { Pokemon, StatName } from '../types/pokemon'
import { STAT_LABELS } from '../types/pokemon'
import { STAT_ORDER, GAME_CONFIG } from '../config/constants'

interface PokemonCardProps {
  pokemon: Pokemon
  availableStats: StatName[]
  selectedStatName: StatName | null
  statsRevealed: boolean
  onSelectStatName: (stat: StatName) => void
  onConfirmSelection: () => void
  round: number
  selectedStats: Array<{
    pokemon: Pokemon
    statName: StatName
    value: number
  }>
  skipConfirmation: boolean
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

export const PokemonCard = ({
  pokemon,
  availableStats,
  selectedStatName,
  statsRevealed,
  onSelectStatName,
  onConfirmSelection,
  round,
  selectedStats,
  skipConfirmation
}: PokemonCardProps) => {
  const { t, i18n } = useTranslation()

  const getStatValue = (statName: StatName): number => {
    const stat = pokemon.stats.find(s => s.stat.name === statName)
    return stat?.base_stat || 0
  }

  // Find which Pokemon has each stat
  const getPokemonForStat = (statName: StatName) => {
    return selectedStats.find(s => s.statName === statName)
  }

  const allStats = [...STAT_ORDER] as StatName[]

  return (
    <div className="pokemon-card-game">
      <div className="round-indicator">
        {t('gameProgress.round')} {round} / {GAME_CONFIG.ROUNDS_PER_GAME}
      </div>

      <div className="pokemon-info">
        <h2>
          {getPokemonName(pokemon, i18n.language)}
          {pokemon.isShiny && <span className="shiny-badge">✨ Shiny!</span>}
        </h2>
        <img
          src={getPokemonSprite(pokemon)}
          alt={pokemon.name}
          className="pokemon-sprite"
        />
        <p className="pokemon-number">#{pokemon.id}</p>
        <div className="pokemon-types">
          {pokemon.types.map((type, index) => (
            <span key={index} className={`type-badge type-${type.type.name}`}>
              {type.type.name}
            </span>
          ))}
        </div>
      </div>

      <div className="stats-selection-blind">
        <h3>{statsRevealed ? '📊 Statistiques révélées !' : '🎯 Devinez la meilleure statistique !'}</h3>
        {!statsRevealed && (
          <p className="blind-hint">
            Choisissez la statistique que vous pensez être la plus élevée.
            Les valeurs seront révélées après confirmation.
          </p>
        )}
        
        <div className="stats-grid">
          {allStats.map((statName) => {
            const value = getStatValue(statName)
            const isAvailable = availableStats.includes(statName)
            const isSelected = selectedStatName === statName
            const pokemonWithStat = getPokemonForStat(statName)
            
            if (statsRevealed) {
              // Revealed state: show actual values with Pokemon sprite for current round
              const isChosen = pokemonWithStat !== undefined
              
              return (
                <div
                  key={statName}
                  className={`stat-card ${isChosen ? 'stat-chosen' : ''}`}
                >
                  <span className="stat-name">{STAT_LABELS[statName]}</span>
                  {pokemonWithStat ? (
                    <div className="stat-with-sprite">
                      <img
                        src={getPokemonSprite(pokemonWithStat.pokemon)}
                        alt={getPokemonName(pokemonWithStat.pokemon, i18n.language)}
                        className="stat-sprite"
                      />
                      <span className="stat-value">{value}</span>
                    </div>
                  ) : (
                    <span className="stat-value">{value}</span>
                  )}
                  {isChosen && <span className="chosen-badge">✓ Choisi</span>}
                </div>
              )
            } else {
              // Hidden state: show mystery cards OR already selected stats from previous rounds
              if (pokemonWithStat) {
                // This stat was selected in a previous round - show it with sprite
                return (
                  <div
                    key={statName}
                    className="stat-card stat-chosen"
                  >
                    <span className="stat-name">{STAT_LABELS[statName]}</span>
                    <div className="stat-with-sprite">
                      <img
                        src={getPokemonSprite(pokemonWithStat.pokemon)}
                        alt={getPokemonName(pokemonWithStat.pokemon, i18n.language)}
                        className="stat-sprite"
                      />
                      <span className="stat-value">{pokemonWithStat.value}</span>
                    </div>
                    <span className="chosen-badge">✓ Choisi</span>
                  </div>
                )
              } else {
                // This stat hasn't been selected yet - show mystery card
                return (
                  <button
                    key={statName}
                    onClick={() => onSelectStatName(statName)}
                    disabled={!isAvailable}
                    className={`stat-button-blind ${!isAvailable ? 'stat-disabled' : ''} ${isSelected ? 'stat-selected' : ''}`}
                  >
                    <span className="stat-name">{STAT_LABELS[statName]}</span>
                    <span className="stat-mystery">?</span>
                  </button>
                )
              }
            }
          })}
        </div>
      </div>

      {!statsRevealed && selectedStatName && !skipConfirmation && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            onSelectStatName(null as any)
          }
        }}>
          <div className="confirmation-modal">
            <h3>Confirmer votre choix</h3>
            <p className="confirmation-text">
              Vous avez sélectionné : <strong>{STAT_LABELS[selectedStatName]}</strong>
            </p>
            <p className="confirmation-hint">
              Êtes-vous sûr de vouloir choisir cette statistique ?
            </p>
            <div className="modal-buttons">
              <button onClick={() => onSelectStatName(null as any)} className="cancel-button">
                ✕ Annuler
              </button>
              <button onClick={onConfirmSelection} className="confirm-button">
                ✓ {t('pokemonCard.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}