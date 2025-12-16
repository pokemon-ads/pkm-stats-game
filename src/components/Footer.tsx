import { useTranslation } from 'react-i18next'
import '../styles/Footer.css'

export const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="app-footer">
      <p className="footer-text">{t('home.footerText')}</p>
      <div className="footer-pokemon">
        <span>⚡</span>
        <span>🔥</span>
        <span>💧</span>
        <span>🌿</span>
      </div>
    </footer>
  )
}