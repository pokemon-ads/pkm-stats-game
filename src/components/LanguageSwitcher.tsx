import { useTranslation } from 'react-i18next';
import '../styles/LanguageSwitcher.css';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button 
        className={`lang-btn ${i18n.language.startsWith('fr') ? 'active' : ''}`}
        onClick={() => changeLanguage('fr')}
        title="Français"
      >
        🇫🇷
      </button>
      <button 
        className={`lang-btn ${i18n.language.startsWith('en') ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        title="English"
      >
        🇬🇧
      </button>
    </div>
  );
};