import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useClickerGame } from '../hooks/useClickerGame';

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