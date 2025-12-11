import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="game-config-wrapper">
      <div className={`game-config ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="config-header" onClick={() => setIsExpanded(!isExpanded)} title={t('config.title')}>
          {isExpanded ? (
            <h3 className="config-title">{t('config.title')}</h3>
          ) : (
            <span className="config-icon">⚙️</span>
          )}
          {isExpanded && (
            <button className="toggle-button" aria-label={t('config.collapse')}>
              ◀
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="config-content">
          <div className="config-group">
            <div className="config-toggle-row">
              <span className="config-label-text">{t('config.fastMode')}</span>
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
              {skipConfirmation ? t('config.fastModeHintOn') : t('config.fastModeHintOff')}
            </p>
          </div>

          <div className="config-group">
            <div className="config-toggle-row">
              <span className="config-label-text">{t('config.shinyBonus')}</span>
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
              {shinyBonus ? t('config.shinyBonusHintOn') : t('config.shinyBonusHintOff')}
            </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}