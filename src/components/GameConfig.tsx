import { useState } from 'react'
import '../styles/GameConfig.css'

interface GameConfigProps {
  skipConfirmation: boolean
  shinyBonus: boolean
  onSkipConfirmationChange: (value: boolean) => void
  onShinyBonusChange: (value: boolean) => void
}

export const GameConfig = ({
  skipConfirmation,
  shinyBonus,
  onSkipConfirmationChange,
  onShinyBonusChange
}: GameConfigProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`game-config ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="config-header" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? (
          <h3 className="config-title">⚙️ Paramètres</h3>
        ) : (
          <span className="config-icon">⚙️</span>
        )}
        <button className="toggle-button" aria-label={isExpanded ? 'Réduire' : 'Agrandir'}>
          {isExpanded ? '◀' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="config-content">
          <div className="config-group">
            <div className="config-toggle-row">
              <span className="config-label-text">⚡ Mode rapide</span>
              <label className="switch-container-sidebar">
                <input
                  type="checkbox"
                  checked={skipConfirmation}
                  onChange={(e) => onSkipConfirmationChange(e.target.checked)}
                  className="switch-input-sidebar"
                />
                <span className="switch-slider-sidebar"></span>
              </label>
            </div>
            <p className="config-hint">
              {skipConfirmation ? '⚡ Sélection directe sans confirmation' : '✓ Confirmation avant validation'}
            </p>
          </div>

          <div className="config-group">
            <div className="config-toggle-row">
              <span className="config-label-text">✨ Bonus Shiny x2</span>
              <label className="switch-container-sidebar">
                <input
                  type="checkbox"
                  checked={shinyBonus}
                  onChange={(e) => onShinyBonusChange(e.target.checked)}
                  className="switch-input-sidebar"
                />
                <span className="switch-slider-sidebar"></span>
              </label>
            </div>
            <p className="config-hint">
              {shinyBonus ? '✨ Stats des shiny doublées' : '⭕ Stats normales pour les shiny'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}