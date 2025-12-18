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
        
        <NavLink
          to="/pokequizz"
          className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
        >
          ❓ {t('nav.pokequizz')}
        </NavLink>
      </div>
      
      <div className="navbar-actions">
        <LanguageSwitcher />
      </div>
    </nav>
  )
}