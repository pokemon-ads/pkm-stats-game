import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import '../styles/Footer.css'

export const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About PKM Stats</h3>
          <p>Free Pokemon games and quizzes to test your knowledge. Challenge yourself with stats guessing, Pokemon identification, and idle clicker games.</p>
        </div>
        
        <div className="footer-section">
          <h3>Legal</h3>
          <div className="footer-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>

        <div className="footer-section">
          <h3>Games</h3>
          <div className="footer-links">
            <Link to="/pokestats">PokéStats</Link>
            <Link to="/pokequizz">PokéQuizz</Link>
            <Link to="/clicker">PokéClicker</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-text">{t('home.footerText')}</p>
        <p className="footer-copyright">© {new Date().getFullYear()} PKM Stats. All rights reserved. This website is not affiliated with, endorsed by, or sponsored by Nintendo, Game Freak, or The Pokémon Company.</p>
      </div>

      <div className="footer-pokemon">
        <span>⚡</span>
        <span>🔥</span>
        <span>💧</span>
        <span>🌿</span>
      </div>
    </footer>
  )
}