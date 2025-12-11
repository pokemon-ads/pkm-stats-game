import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { LanguageSwitcher } from './LanguageSwitcher'
import '../styles/Navbar.css'

export const Navbar = () => {
  const { t } = useTranslation()

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
        >
          🏠 {t('nav.home')}
        </NavLink>
        
        <NavLink
          to="/pokestats"
          className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
        >
          📊 {t('nav.pokestats')}
        </NavLink>
        
        <button
          className="nav-button disabled"
          disabled
          title={t('nav.comingSoon')}
        >
          🚧 {t('nav.comingSoon')}
        </button>
      </div>
      
      <div className="navbar-actions">
        <LanguageSwitcher />
      </div>
    </nav>
  )
}