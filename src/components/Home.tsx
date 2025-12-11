import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import '../styles/Home.css'

export const Home = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="home-container">
      <h1>{t('home.title')}</h1>
      <div className="games-grid">
        <div className="game-card" onClick={() => navigate('/pokestats')}>
          <div className="game-icon">📊</div>
          <h2>{t('nav.pokestats')}</h2>
          <p>{t('welcome.intro')}</p>
          <button className="play-button">{t('setup.play')}</button>
        </div>
        
        <div className="game-card disabled">
          <div className="game-icon">🚧</div>
          <h2>{t('nav.comingSoon')}</h2>
          <p>More games coming soon!</p>
        </div>
      </div>
    </div>
  )
}