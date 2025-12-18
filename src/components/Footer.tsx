import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import '../styles/Footer.css'

export const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="app-footer">
      <p className="footer-text">{t('home.footerText')}</p>
      
      <div className="footer-links">
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/terms-of-service">Terms of Service</Link>
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