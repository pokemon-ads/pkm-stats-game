import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import '../styles/Footer.css'

export const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>{t('clicker.footer.aboutTitle')}</h3>
          <p>{t('clicker.footer.aboutText')}</p>
        </div>
        
        <div className="footer-section">
          <h3>{t('clicker.footer.legalTitle')}</h3>
          <div className="footer-links">
            <Link to="/privacy-policy">{t('clicker.footer.privacyPolicy')}</Link>
            <Link to="/terms-of-service">{t('clicker.footer.termsOfService')}</Link>
          </div>
        </div>

        <div className="footer-section">
          <h3>{t('clicker.footer.gamesTitle')}</h3>
          <div className="footer-links">
            <Link to="/pokestats">{t('nav.pokestats')}</Link>
            <Link to="/pokequizz">{t('nav.pokequizz')}</Link>
            <Link to="/clicker">{t('nav.pokeclicker')}</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-text">{t('home.footerText')}</p>
        <p className="footer-copyright">{t('clicker.footer.copyright', { year: new Date().getFullYear() })}</p>
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