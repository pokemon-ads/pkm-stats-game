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
          
          <div className="game-card pokequizz-card" onClick={() => navigate('/pokequizz')}>
            <div className="card-glow"></div>
            <div className="game-header">
              <div className="game-icon-wrapper">
                <span className="game-icon">❓</span>
              </div>
              <div className="game-badge new">{t('home.new')}</div>
            </div>
            <h3 className="game-title">{t('nav.pokequizz')}</h3>
            <p className="game-description">{t('home.pokequizzDesc')}</p>
            <div className="game-features">
              <span className="feature-tag">🧠 {t('home.featureKnowledge')}</span>
              <span className="feature-tag">⚡ {t('home.featureSpeed')}</span>
            </div>
            <button className="play-button">
              <span className="button-text">{t('home.letsPlay')}</span>
              <span className="button-arrow">→</span>
            </button>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2 className="section-title">{t('home.about.title')}</h2>
        <div className="about-content">
          <p className="about-intro">{t('home.about.intro')}</p>
          
          <div className="about-grid">
            <div className="about-card">
              <h3>{t('home.about.pokestatsTitle')}</h3>
              <p>{t('home.about.pokestatsText')}</p>
            </div>
            
            <div className="about-card">
              <h3>{t('home.about.pokequizzTitle')}</h3>
              <p>{t('home.about.pokequizzText')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}