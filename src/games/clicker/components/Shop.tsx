import React, { useContext, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ClickerContext } from '../context/ClickerContext';
import { AVAILABLE_BOOSTS, calculateBoostCost } from '../config/boosts';
import type { Boost } from '../types/game';

// Format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1e18) return (num / 1e18).toFixed(1) + 'Qi';
  if (num >= 1e15) return (num / 1e15).toFixed(1) + 'Qa';
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.floor(num).toLocaleString();
};

// Format time in seconds to readable string
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const Shop: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(ClickerContext);

  const handlePurchase = useCallback((boostId: string) => {
    dispatch({ type: 'ACTIVATE_BOOST', payload: { boostId } });
  }, [dispatch]);

  // Check if boost is available (not on cooldown)
  const isBoostAvailable = useCallback((boost: Boost): boolean => {
    const cooldown = state.boostCooldowns.find(c => c.boostId === boost.id);
    if (cooldown) {
      return Date.now() >= cooldown.availableAt;
    }
    return true;
  }, [state.boostCooldowns]);

  // Get remaining cooldown time
  const getCooldownRemaining = useCallback((boost: Boost): number => {
    const cooldown = state.boostCooldowns.find(c => c.boostId === boost.id);
    if (cooldown && Date.now() < cooldown.availableAt) {
      return Math.ceil((cooldown.availableAt - Date.now()) / 1000);
    }
    return 0;
  }, [state.boostCooldowns]);

  // Check if boost is currently active
  const isBoostActive = useCallback((boost: Boost): boolean => {
    return state.activeBoosts.some(b => b.boostId === boost.id);
  }, [state.activeBoosts]);

  // Get remaining time for active boost
  const getActiveBoostRemaining = useCallback((boost: Boost): number => {
    const activeBoost = state.activeBoosts.find(b => b.boostId === boost.id);
    if (activeBoost && activeBoost.expiresAt > Date.now()) {
      return Math.ceil((activeBoost.expiresAt - Date.now()) / 1000);
    }
    return 0;
  }, [state.activeBoosts]);

  // Group boosts by type
  const groupedBoosts = useMemo(() => {
    const groups: Record<string, Boost[]> = {
      click: [],
      production: [],
      instant: [],
      auto: [],
    };

    AVAILABLE_BOOSTS.forEach(boost => {
      if (boost.type === 'CLICK_MULTIPLIER') {
        groups.click.push(boost);
      } else if (boost.type === 'PRODUCTION_MULTIPLIER') {
        groups.production.push(boost);
      } else if (boost.type === 'INSTANT_ENERGY') {
        groups.instant.push(boost);
      } else if (boost.type === 'AUTO_CLICKER') {
        groups.auto.push(boost);
      }
    });

    return groups;
  }, []);

  return (
    <div className="shop-container-embedded">
      <div className="shop-content">

        {/* Click Boosts */}
        {groupedBoosts.click.length > 0 && (
          <div className="boost-category">
            <h3 className="category-title">⚡ {t('clicker.shop.clickBoosts', 'Boostes de Clic')}</h3>
            <div className="boosts-grid">
              {groupedBoosts.click.map(boost => {
                const available = isBoostAvailable(boost);
                const dynamicCost = calculateBoostCost(boost, state.energyPerSecond);
                const canAfford = state.energy >= dynamicCost;
                const cooldownRemaining = getCooldownRemaining(boost);
                const isActive = isBoostActive(boost);
                const activeRemaining = getActiveBoostRemaining(boost);

                return (
                  <div
                    key={boost.id}
                    className={`boost-card ${canAfford && available ? 'affordable' : ''} ${isActive ? 'active' : ''} ${!available ? 'on-cooldown' : ''}`}
                  >
                    <div className="boost-icon-large">
                      {boost.icon && boost.icon.startsWith('http') ? (
                        <img 
                          src={boost.icon} 
                          alt={boost.name}
                          className="boost-icon-image"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'boost-icon-fallback';
                            fallback.textContent = '⚡';
                            e.currentTarget.parentElement?.appendChild(fallback);
                          }}
                        />
                      ) : (
                        <span className="boost-icon-fallback">{boost.icon}</span>
                      )}
                    </div>
                    <div className="boost-info">
                      <h4 className="boost-name">{boost.name}</h4>
                      <p className="boost-description">{boost.description}</p>
                      <div className="boost-stats">
                        <span className="boost-stat">
                          ⏱️ {boost.duration > 0 ? formatTime(boost.duration) : t('clicker.shop.instant', 'Instantané')}
                        </span>
                        <span className="boost-stat">
                          🔄 {formatTime(boost.cooldown)}
                        </span>
                      </div>
                    </div>
                    <div className="boost-actions">
                      {isActive && activeRemaining > 0 ? (
                        <div className="boost-active-indicator">
                          <span>✨ {t('clicker.shop.active', 'Actif')}</span>
                          <span className="boost-timer-small">{formatTime(activeRemaining)}</span>
                        </div>
                      ) : !available ? (
                        <div className="boost-cooldown-indicator">
                          <span>⏳ {t('clicker.shop.cooldown', 'Rechargement')}</span>
                          <span className="boost-timer-small">{formatTime(cooldownRemaining)}</span>
                        </div>
                      ) : (
                        <button
                          className={`boost-buy-btn ${canAfford ? 'can-afford' : 'too-expensive'}`}
                          onClick={() => handlePurchase(boost.id)}
                          disabled={!canAfford}
                        >
                          <span className="btn-price">⚡{formatNumber(dynamicCost)}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Production Boosts */}
        {groupedBoosts.production.length > 0 && (
          <div className="boost-category">
            <h3 className="category-title">📈 {t('clicker.shop.productionBoosts', 'Boostes de Production')}</h3>
            <div className="boosts-grid">
              {groupedBoosts.production.map(boost => {
                const available = isBoostAvailable(boost);
                const dynamicCost = calculateBoostCost(boost, state.energyPerSecond);
                const canAfford = state.energy >= dynamicCost;
                const cooldownRemaining = getCooldownRemaining(boost);
                const isActive = isBoostActive(boost);
                const activeRemaining = getActiveBoostRemaining(boost);

                return (
                  <div
                    key={boost.id}
                    className={`boost-card ${canAfford && available ? 'affordable' : ''} ${isActive ? 'active' : ''} ${!available ? 'on-cooldown' : ''}`}
                  >
                    <div className="boost-icon-large">
                      {boost.icon && boost.icon.startsWith('http') ? (
                        <img 
                          src={boost.icon} 
                          alt={boost.name}
                          className="boost-icon-image"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'boost-icon-fallback';
                            fallback.textContent = '⚡';
                            e.currentTarget.parentElement?.appendChild(fallback);
                          }}
                        />
                      ) : (
                        <span className="boost-icon-fallback">{boost.icon}</span>
                      )}
                    </div>
                    <div className="boost-info">
                      <h4 className="boost-name">{boost.name}</h4>
                      <p className="boost-description">{boost.description}</p>
                      <div className="boost-stats">
                        <span className="boost-stat">
                          ⏱️ {boost.duration > 0 ? formatTime(boost.duration) : t('clicker.shop.instant', 'Instantané')}
                        </span>
                        <span className="boost-stat">
                          🔄 {formatTime(boost.cooldown)}
                        </span>
                      </div>
                    </div>
                    <div className="boost-actions">
                      {isActive && activeRemaining > 0 ? (
                        <div className="boost-active-indicator">
                          <span>✨ {t('clicker.shop.active', 'Actif')}</span>
                          <span className="boost-timer-small">{formatTime(activeRemaining)}</span>
                        </div>
                      ) : !available ? (
                        <div className="boost-cooldown-indicator">
                          <span>⏳ {t('clicker.shop.cooldown', 'Rechargement')}</span>
                          <span className="boost-timer-small">{formatTime(cooldownRemaining)}</span>
                        </div>
                      ) : (
                        <button
                          className={`boost-buy-btn ${canAfford ? 'can-afford' : 'too-expensive'}`}
                          onClick={() => handlePurchase(boost.id)}
                          disabled={!canAfford}
                        >
                          <span className="btn-price">⚡{formatNumber(dynamicCost)}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Instant Energy */}
        {groupedBoosts.instant.length > 0 && (
          <div className="boost-category">
            <h3 className="category-title">💎 {t('clicker.shop.instantEnergy', 'Énergie Instantanée')}</h3>
            <div className="boosts-grid">
              {groupedBoosts.instant.map(boost => {
                const available = isBoostAvailable(boost);
                const dynamicCost = calculateBoostCost(boost, state.energyPerSecond);
                const canAfford = state.energy >= dynamicCost;
                const cooldownRemaining = getCooldownRemaining(boost);

                return (
                  <div
                    key={boost.id}
                    className={`boost-card ${canAfford && available ? 'affordable' : ''} ${!available ? 'on-cooldown' : ''}`}
                  >
                    <div className="boost-icon-large">
                      {boost.icon && boost.icon.startsWith('http') ? (
                        <img 
                          src={boost.icon} 
                          alt={boost.name}
                          className="boost-icon-image"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'boost-icon-fallback';
                            fallback.textContent = '⚡';
                            e.currentTarget.parentElement?.appendChild(fallback);
                          }}
                        />
                      ) : (
                        <span className="boost-icon-fallback">{boost.icon}</span>
                      )}
                    </div>
                    <div className="boost-info">
                      <h4 className="boost-name">{boost.name}</h4>
                      <p className="boost-description">{boost.description}</p>
                      <div className="boost-stats">
                        <span className="boost-stat">
                          🔄 {formatTime(boost.cooldown)}
                        </span>
                      </div>
                    </div>
                    <div className="boost-actions">
                      {!available ? (
                        <div className="boost-cooldown-indicator">
                          <span>⏳ {t('clicker.shop.cooldown', 'Rechargement')}</span>
                          <span className="boost-timer-small">{formatTime(cooldownRemaining)}</span>
                        </div>
                      ) : (
                        <button
                          className={`boost-buy-btn ${canAfford ? 'can-afford' : 'too-expensive'}`}
                          onClick={() => handlePurchase(boost.id)}
                          disabled={!canAfford}
                        >
                          <span className="btn-price">⚡{formatNumber(dynamicCost)}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Auto-Clicker */}
        {groupedBoosts.auto.length > 0 && (
          <div className="boost-category">
            <h3 className="category-title">🤖 {t('clicker.shop.autoClicker', 'Auto-Clicker')}</h3>
            <div className="boosts-grid">
              {groupedBoosts.auto.map(boost => {
                const available = isBoostAvailable(boost);
                const dynamicCost = calculateBoostCost(boost, state.energyPerSecond);
                const canAfford = state.energy >= dynamicCost;
                const cooldownRemaining = getCooldownRemaining(boost);
                const isActive = isBoostActive(boost);
                const activeRemaining = getActiveBoostRemaining(boost);

                return (
                  <div
                    key={boost.id}
                    className={`boost-card ${canAfford && available ? 'affordable' : ''} ${isActive ? 'active' : ''} ${!available ? 'on-cooldown' : ''}`}
                  >
                    <div className="boost-icon-large">
                      {boost.icon && boost.icon.startsWith('http') ? (
                        <img 
                          src={boost.icon} 
                          alt={boost.name}
                          className="boost-icon-image"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const fallback = document.createElement('span');
                            fallback.className = 'boost-icon-fallback';
                            fallback.textContent = '⚡';
                            e.currentTarget.parentElement?.appendChild(fallback);
                          }}
                        />
                      ) : (
                        <span className="boost-icon-fallback">{boost.icon}</span>
                      )}
                    </div>
                    <div className="boost-info">
                      <h4 className="boost-name">{boost.name}</h4>
                      <p className="boost-description">{boost.description}</p>
                      <div className="boost-stats">
                        <span className="boost-stat">
                          ⏱️ {boost.duration > 0 ? formatTime(boost.duration) : t('clicker.shop.instant', 'Instantané')}
                        </span>
                        <span className="boost-stat">
                          🔄 {formatTime(boost.cooldown)}
                        </span>
                      </div>
                    </div>
                    <div className="boost-actions">
                      {isActive && activeRemaining > 0 ? (
                        <div className="boost-active-indicator">
                          <span>✨ {t('clicker.shop.active', 'Actif')}</span>
                          <span className="boost-timer-small">{formatTime(activeRemaining)}</span>
                        </div>
                      ) : !available ? (
                        <div className="boost-cooldown-indicator">
                          <span>⏳ {t('clicker.shop.cooldown', 'Rechargement')}</span>
                          <span className="boost-timer-small">{formatTime(cooldownRemaining)}</span>
                        </div>
                      ) : (
                        <button
                          className={`boost-buy-btn ${canAfford ? 'can-afford' : 'too-expensive'}`}
                          onClick={() => handlePurchase(boost.id)}
                          disabled={!canAfford}
                        >
                          <span className="btn-price">⚡{formatNumber(dynamicCost)}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .shop-container-embedded {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .shop-container-embedded::-webkit-scrollbar {
          width: 8px;
        }

        .shop-container-embedded::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        .shop-container-embedded::-webkit-scrollbar-thumb {
          background: rgba(255, 203, 5, 0.5);
          border-radius: 4px;
        }

        .active-boosts-section {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          border-radius: 12px;
        }

        .section-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #4ade80;
          margin: 0 0 0.75rem 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .active-boosts-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .active-boost-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(74, 222, 128, 0.2);
          border: 1px solid rgba(74, 222, 128, 0.4);
          border-radius: 8px;
          font-size: 0.8rem;
        }

        .boost-icon {
          font-size: 1rem;
        }

        .boost-timer {
          font-weight: 700;
          color: #4ade80;
        }

        .boost-category {
          margin-bottom: 1.5rem;
        }

        .category-title {
          font-size: 1rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .boosts-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .boost-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .boost-card.affordable {
          border-color: rgba(74, 222, 128, 0.5);
          background: rgba(74, 222, 128, 0.1);
        }

        .boost-card.affordable:hover {
          background: rgba(74, 222, 128, 0.15);
          border-color: rgba(74, 222, 128, 0.7);
          transform: translateY(-2px);
        }

        .boost-card.active {
          border-color: rgba(255, 203, 5, 0.6);
          background: rgba(255, 203, 5, 0.15);
          box-shadow: 0 0 20px rgba(255, 203, 5, 0.3);
        }

        .boost-card.on-cooldown {
          opacity: 0.6;
        }

        .boost-icon-large {
          min-width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .boost-icon-image {
          width: 40px;
          height: 40px;
          object-fit: contain;
          image-rendering: pixelated;
        }

        .boost-icon-fallback {
          font-size: 2rem;
        }

        .boost-info {
          flex: 1;
          min-width: 0;
        }

        .boost-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: white;
          margin: 0 0 0.25rem 0;
        }

        .boost-description {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 0.5rem 0;
        }

        .boost-stats {
          display: flex;
          gap: 0.75rem;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .boost-stat {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .boost-actions {
          flex-shrink: 0;
          min-width: 100px;
        }

        .boost-buy-btn {
          width: 100%;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, rgba(255, 203, 5, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%);
          border: 1px solid rgba(255, 203, 5, 0.5);
          border-radius: 8px;
          color: white;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .boost-buy-btn.can-afford {
          background: linear-gradient(135deg, rgba(74, 222, 128, 0.3) 0%, rgba(34, 197, 94, 0.3) 100%);
          border-color: rgba(74, 222, 128, 0.6);
        }

        .boost-buy-btn.can-afford:hover {
          background: linear-gradient(135deg, rgba(74, 222, 128, 0.4) 0%, rgba(34, 197, 94, 0.4) 100%);
          transform: scale(1.05);
        }

        .boost-buy-btn.too-expensive {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .boost-active-indicator,
        .boost-cooldown-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .boost-active-indicator {
          color: #ffcb05;
        }

        .boost-cooldown-indicator {
          color: rgba(255, 255, 255, 0.5);
        }

        .boost-timer-small {
          font-size: 0.7rem;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

