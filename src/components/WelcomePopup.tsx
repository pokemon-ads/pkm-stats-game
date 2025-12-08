import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '../styles/WelcomePopup.css'

const STORAGE_KEY = 'pkm_stats_welcome_seen'

export const WelcomePopup = () => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(STORAGE_KEY)
    if (!hasSeenWelcome) {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="welcome-overlay">
      <div className="welcome-popup">
        <div className="welcome-header">
          <h2>{t('welcome.title')}</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="welcome-content">
          <p className="welcome-intro">{t('welcome.intro')}</p>
          
          <div className="welcome-steps">
            <div className="step">
              <span className="step-icon">🎯</span>
              <div className="step-text">
                <h3>{t('welcome.step1Title')}</h3>
                <p>{t('welcome.step1Desc')}</p>
              </div>
            </div>
            
            <div className="step">
              <span className="step-icon">🤔</span>
              <div className="step-text">
                <h3>{t('welcome.step2Title')}</h3>
                <p>{t('welcome.step2Desc')}</p>
              </div>
            </div>
            
            <div className="step">
              <span className="step-icon">📊</span>
              <div className="step-text">
                <h3>{t('welcome.step3Title')}</h3>
                <p>{t('welcome.step3Desc')}</p>
              </div>
            </div>
          </div>
          
          <button className="start-playing-button" onClick={handleClose}>
            {t('welcome.start')}
          </button>
        </div>
      </div>
    </div>
  )
}