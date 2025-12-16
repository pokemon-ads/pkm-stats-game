import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import '../styles/Home.css'

export const Home = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="home-container">
      <div className="home-hero">
        <div className="hero-pokeball"></div>
        <h1 className="home-title">
          <span className="title-wave">👋</span> {t('home.welcome')}
        </h1>
        <p className="home-subtitle">{t('home.subtitle')}</p>
      </div>

      <div className="games-section">
        <h2 className="section-title">{t('home.gamesTitle')}</h2>
        
        <div className="games-grid">
          <div className="game-card pokestats-card" onClick={() => navigate('/pokestats')}>
            <div className="card-glow"></div>
            <div className="game-header">
              <div className="game-icon-wrapper">
                <span className="game-icon">🎯</span>
              </div>
              <div className="game-badge">{t('home.popular')}</div>
            </div>
            <h3 className="game-title">{t('nav.pokestats')}</h3>
            <p className="game-description">{t('home.pokestatsDesc')}</p>
            <div className="game-features">
              <span className="feature-tag">📊 {t('home.featureStats')}</span>
              <span className="feature-tag">🏆 {t('home.featureLeaderboard')}</span>
            </div>
            <button className="play-button">
              <span className="button-text">{t('home.letsPlay')}</span>
              <span className="button-arrow">→</span>
            </button>
          </div>
          
          <div className="game-card coming-soon-card">
            <div className="game-header">
              <div className="game-icon-wrapper mystery">
                <span className="game-icon">✨</span>
              </div>
            </div>
            <h3 className="game-title">{t('home.mysteryGame')}</h3>
            <p className="game-description">{t('home.comingSoonDesc')}</p>
            <div className="coming-soon-badge">
              <span className="pulse-dot"></span>
              {t('home.inDevelopment')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}