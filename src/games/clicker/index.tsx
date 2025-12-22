import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClickerProvider } from './context/ClickerContext';
import { HUD } from './components/HUD';
import { ClickerArea } from './components/ClickerArea';
import { PokemonList } from './components/PokemonList';
import { UpgradesList } from './components/UpgradesList';
import { BackgroundEffects } from './components/BackgroundEffects';
import './styles/ClickerGame.css';

const PokeClickerGame: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <ClickerProvider>
      <div className="clicker-game-container">
        <BackgroundEffects />
        <h1 className="clicker-game-title">{t('clicker.title')}</h1>
        
        <div className="clicker-layout">
          {/* Left Column - Upgrades & Shop */}
          <div className="clicker-left-column">
            <UpgradesList />
          </div>

          {/* Center Column - Stats & Clicker */}
          <div className="clicker-center-column">
            <HUD />
            <ClickerArea />
          </div>

          {/* Right Column - Pokemon Helpers */}
          <div className="clicker-right-column">
            <PokemonList />
          </div>
        </div>
      </div>
    </ClickerProvider>
  );
};

export default PokeClickerGame;