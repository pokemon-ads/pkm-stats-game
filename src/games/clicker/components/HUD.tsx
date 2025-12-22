import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useClickerGame } from '../hooks/useClickerGame';
import { AVAILABLE_BOOSTS } from '../config/boosts';
import { getItemSpriteUrl, BOOST_ITEM_MAP } from '../utils/itemSprites';

// Format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1e18) return (num / 1e18).toFixed(2) + 'Qi';
  if (num >= 1e15) return (num / 1e15).toFixed(2) + 'Qa';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return Math.floor(num).toLocaleString();
};

export const HUD: React.FC = () => {
  const { t } = useTranslation();
  const { state, resetGame } = useClickerGame();
  const [prevEnergy, setPrevEnergy] = useState(state.energy);
  const [isGaining, setIsGaining] = useState(false);

  // Animate energy changes
  useEffect(() => {
    if (state.energy > prevEnergy) {
      setIsGaining(true);
      const timer = setTimeout(() => setIsGaining(false), 200);
      return () => clearTimeout(timer);
    }
    setPrevEnergy(state.energy);
  }, [state.energy, prevEnergy]);

  const handleReset = () => {
    if (window.confirm(t('clicker.resetConfirm'))) {
      resetGame();
    }
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

  // Get active boosts with remaining time
  const activeBoostsDisplay = useMemo(() => {
    return state.activeBoosts.map(activeBoost => {
      const boost = AVAILABLE_BOOSTS.find(b => b.id === activeBoost.boostId);
      if (!boost) return null;
      const remaining = Math.ceil((activeBoost.expiresAt - Date.now()) / 1000);
      if (remaining <= 0) return null;
      
      return {
        icon: boost.icon,
        name: boost.name,
        remaining: formatTime(remaining),
        value: activeBoost.value,
        boostId: boost.id,
      };
    }).filter(Boolean);
  }, [state.activeBoosts]);

  return (
    <div className="hud-container">
      <div className="hud-stats">
        <div className="hud-stat">
          <h3>⚡ {t('clicker.energy')}</h3>
          <p className={`hud-stat-value ${isGaining ? 'gaining' : ''}`}>
            {formatNumber(state.energy)}
          </p>
        </div>
        <div className="hud-stat">
          <h3>📈 {t('clicker.perSecond')}</h3>
          <p className="hud-stat-value">
            {formatNumber(state.energyPerSecond)}/s
          </p>
        </div>
        <div className="hud-stat">
          <h3>👆 {t('clicker.perClick')}</h3>
          <p className="hud-stat-value">
            {formatNumber(state.energyPerClick)}
          </p>
        </div>
      </div>

      {/* Active Boosts Display */}
      {activeBoostsDisplay.length > 0 && (
        <div className="hud-active-boosts">
          <div className="active-boosts-label">{t('clicker.shop.activeBoosts', 'Boosts Actifs')}:</div>
          <div className="active-boosts-list">
            {activeBoostsDisplay.map((boost, index) => (
              <div key={boost?.boostId || index} className="active-boost-badge-hud">
                {boost?.icon && boost.icon.startsWith('http') ? (
                  <img 
                    src={boost.icon} 
                    alt={boost.name}
                    className="boost-icon-hud-image"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const fallback = document.createElement('span');
                      fallback.className = 'boost-icon-hud';
                      fallback.textContent = '⚡';
                      e.currentTarget.parentElement?.appendChild(fallback);
                    }}
                  />
                ) : (
                  <span className="boost-icon-hud">{boost?.icon || '⚡'}</span>
                )}
                <span className="boost-name-hud">{boost?.name}</span>
                <span className="boost-timer-hud">{boost?.remaining}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="hud-extra-stats">
        <div className="hud-mini-stat">
          <span className="mini-label">{t('clicker.totalEarned')}:</span>
          <span className="mini-value">{formatNumber(state.totalEnergy)}</span>
        </div>
        <div className="hud-mini-stat">
          <span className="mini-label">{t('clicker.totalClicks')}:</span>
          <span className="mini-value">{state.clickCount.toLocaleString()}</span>
        </div>
        <button className="hud-reset-btn-mini" onClick={handleReset} title={t('clicker.resetProgress')}>
          🔄
        </button>
      </div>
      
      <style>{`
        .hud-stat-value.gaining {
          animation: energyGain 0.2s ease-out;
        }
        
        @keyframes energyGain {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); color: #4ade80; }
          100% { transform: scale(1); }
        }

        .hud-active-boosts {
          margin: 1rem 0;
          padding: 0.75rem;
          background: rgba(255, 203, 5, 0.1);
          border: 1px solid rgba(255, 203, 5, 0.3);
          border-radius: 10px;
          position: relative;
          z-index: 1;
        }

        .active-boosts-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #ffcb05;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }

        .active-boosts-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .active-boost-badge-hud {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.6rem;
          background: rgba(255, 203, 5, 0.2);
          border: 1px solid rgba(255, 203, 5, 0.4);
          border-radius: 8px;
          font-size: 0.75rem;
        }

        .boost-icon-hud {
          font-size: 0.9rem;
        }

        .boost-icon-hud-image {
          width: 20px;
          height: 20px;
          object-fit: contain;
          image-rendering: pixelated;
        }

        .boost-name-hud {
          font-weight: 600;
          color: white;
        }

        .boost-timer-hud {
          font-weight: 700;
          color: #ffcb05;
          font-variant-numeric: tabular-nums;
        }
        
        .hud-extra-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          position: relative;
          z-index: 1;
        }
        
        .hud-mini-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          flex: 1;
        }
        
        .mini-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .mini-value {
          font-size: 0.9rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.8);
          font-variant-numeric: tabular-nums;
        }
        
        .hud-reset-btn-mini {
          width: 32px;
          height: 32px;
          min-width: 32px;
          padding: 0;
          background: rgba(239, 68, 68, 0.3);
          color: white;
          border: 1px solid rgba(239, 68, 68, 0.5);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .hud-reset-btn-mini:hover {
          background: rgba(239, 68, 68, 0.5);
          border-color: rgba(239, 68, 68, 0.8);
        }
      `}</style>
    </div>
  );
};