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
          onClick={() => {
            // Dispatch event to reset game if already on pokestats
            if (window.location.pathname === '/pokestats') {
              window.dispatchEvent(new CustomEvent('pokestats-reset'))
            }
          }}
        >
          📊 {t('nav.pokestats')}
        </NavLink>
        
        <NavLink
          to="/pokequizz"
          className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
        >
          ❓ {t('nav.pokequizz')}
        </NavLink>

        <NavLink
          to="/clicker"
          className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
        >
          ⚡ {t('nav.pokeclicker')}
        </NavLink>
      </div>
      
      <div className="navbar-actions">
        <LanguageSwitcher />
      </div>
    </nav>
  )
}