import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useClickerGame } from '../hooks/useClickerGame';
import { AVAILABLE_BOOSTS } from '../config/boosts';
import { formatNumber, formatTime } from '../utils/formatNumber';
import '../styles/HUD.css';

// Memoized boost badge component
const BoostBadge = memo(({ boost }: { boost: { icon?: string; name: string; remaining: string; boostId: string } }) => (
  <div className="boost-badge">
    {boost.icon && boost.icon.startsWith('http') ? (
      <img
        src={boost.icon}
        alt={boost.name}
        className="boost-badge-icon-img"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    ) : (
      <span className="boost-badge-icon">{boost.icon || '⚡'}</span>
    )}
    <span className="boost-badge-timer">{boost.remaining}</span>
  </div>
));

BoostBadge.displayName = 'BoostBadge';

// Item sprites from PokeAPI
const getItemSprite = (itemName: string) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemName}.png`;

// Sprite URLs for HUD icons - RARE ITEMS
const SPRITE_ICONS = {
  energy: getItemSprite('soul-dew'),           // Légendaire - Âme Rosée
  production: getItemSprite('lucky-egg'),       // Lucky Egg
  click: getItemSprite('adamant-orb'),          // Orbe Adamant (Dialga)
  pokeball: getItemSprite('master-ball'),       // Master Ball
  save: getItemSprite('data-card'),             // Data Card
  import: getItemSprite('old-sea-map'),         // Old Sea Map (rare event)
  reset: getItemSprite('ability-patch'),        // Ability Patch (rare)
};

export const HUD: React.FC = memo(() => {
  const { t } = useTranslation();
  const { state, resetGame, exportSave, importSave } = useClickerGame();
  const prevEnergyRef = useRef(state.energy);
  const [isGaining, setIsGaining] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Animate energy changes - optimized to reduce state updates
  useEffect(() => {
    if (state.energy > prevEnergyRef.current) {
      setIsGaining(true);
      const timer = setTimeout(() => setIsGaining(false), 200);
      prevEnergyRef.current = state.energy;
      return () => clearTimeout(timer);
    }
    prevEnergyRef.current = state.energy;
  }, [state.energy]);

  const handleReset = () => {
    if (window.confirm(t('clicker.resetConfirm'))) {
      resetGame();
    }
  };

  // Encode save data to base64 for sharing
  const encodeSaveToShareCode = (saveData: string): string => {
    return btoa(unescape(encodeURIComponent(saveData)));
  };

  // Decode base64 share code to save data
  const decodeShareCodeToSave = (shareCode: string): string => {
    try {
      return decodeURIComponent(escape(atob(shareCode)));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new Error(t('clicker.save.invalidCode'));
    }
  };

  const handleExportAsCode = () => {
    const saveData = exportSave();
    const code = encodeSaveToShareCode(saveData);
    setShareCode(code);
    setShowExportModal(true);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      const textarea = document.createElement('textarea');
      textarea.value = shareCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleImport = () => {
    setImportError(null);
    if (!importText.trim()) {
      setImportError(t('clicker.save.pasteValidCode'));
      return;
    }

    let saveData = importText.trim();
    saveData = saveData.replace(/\s/g, '');
    
    try {
      saveData = decodeShareCodeToSave(saveData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setImportError(t('clicker.save.invalidCodeFull'));
      return;
    }

    const success = importSave(saveData);
    if (success) {
      setShowImportModal(false);
      setImportText('');
      window.location.reload();
    } else {
      setImportError(t('clicker.save.importFailed'));
    }
  };

  // Force update for boost timers - only when there are active boosts
  const [boostTick, setBoostTick] = useState(0);
  const hasActiveBoosts = state.activeBoosts.length > 0;
  
  useEffect(() => {
    if (!hasActiveBoosts) return;
    const timer = setInterval(() => setBoostTick(n => n + 1), 1000);
    return () => clearInterval(timer);
  }, [hasActiveBoosts]);

  // Get active boosts with remaining time
  const activeBoostsDisplay = useMemo(() => {
    const now = Date.now();
    return state.activeBoosts.map(activeBoost => {
      const boost = AVAILABLE_BOOSTS.find(b => b.id === activeBoost.boostId);
      if (!boost) return null;
      const remaining = Math.ceil((activeBoost.expiresAt - now) / 1000);
      if (remaining <= 0) return null;
      
      return {
        icon: boost.icon,
        name: boost.name,
        remaining: formatTime(remaining),
        value: activeBoost.value,
        boostId: boost.id,
      };
    }).filter(Boolean);
  }, [state.activeBoosts, boostTick]);

  return (
    <>
      <div className="trainer-card">
        {/* Card Header */}
        <div className="trainer-card-header">
          <div className="trainer-card-title">
            <img src={SPRITE_ICONS.pokeball} alt="" className="header-icon" />
            TRAINER CARD
          </div>
          <div className="trainer-card-actions">
            <button className="trainer-action-btn export" onClick={handleExportAsCode} title={t('clicker.save.exportButton')}>
              <img src={SPRITE_ICONS.save} alt="" className="action-icon" />
            </button>
            <button className="trainer-action-btn import" onClick={() => setShowImportModal(true)} title={t('clicker.save.importButton')}>
              <img src={SPRITE_ICONS.import} alt="" className="action-icon" />
            </button>
            <button className="trainer-action-btn reset" onClick={handleReset} title={t('clicker.resetProgress')}>
              <img src={getItemSprite('ability-capsule')} alt="" className="action-icon" />
            </button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="trainer-stats-grid">
          <div className="trainer-stat energy-stat">
            <div className="stat-icon">
              <img src={SPRITE_ICONS.energy} alt="" className="stat-icon-img" />
            </div>
            <div className="stat-content">
              <span className="stat-label">{t('clicker.energy')}</span>
              <span className={`stat-value ${isGaining ? 'gaining' : ''}`}>
                {formatNumber(state.energy)}
              </span>
            </div>
          </div>
          
          <div className="trainer-stat production-stat">
            <div className="stat-icon">
              <img src={SPRITE_ICONS.production} alt="" className="stat-icon-img" />
            </div>
            <div className="stat-content">
              <span className="stat-label">{t('clicker.perSecond')}</span>
              <span className="stat-value">
                {formatNumber(state.energyPerSecond)}/s
              </span>
            </div>
          </div>
          
          <div className="trainer-stat click-stat">
            <div className="stat-icon">
              <img src={SPRITE_ICONS.click} alt="" className="stat-icon-img" />
            </div>
            <div className="stat-content">
              <span className="stat-label">{t('clicker.perClick')}</span>
              <span className="stat-value">
                {formatNumber(state.energyPerClick)}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Stats Row */}
        <div className="trainer-secondary-stats">
          <div className="secondary-stat">
            <span className="secondary-label">{t('clicker.totalEarned')}:</span>
            <span className="secondary-value">{formatNumber(state.totalEnergy)}</span>
          </div>
          <div className="secondary-stat">
            <span className="secondary-label">{t('clicker.totalClicks')}:</span>
            <span className="secondary-value">{state.clickCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Active Boosts */}
        {activeBoostsDisplay.length > 0 && (
          <div className="trainer-boosts">
            <div className="boosts-title">{t('clicker.shop.activeBoosts')}</div>
            <div className="boosts-list">
              {activeBoostsDisplay.map((boost) => boost && (
                <BoostBadge key={boost.boostId} boost={boost} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && createPortal(
        (
          <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
            <div className="pokemon-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pokemon-modal-header">
                <h3>{t('clicker.save.exportTitle')}</h3>
                <button className="pokemon-modal-close" onClick={() => setShowExportModal(false)}>✕</button>
              </div>
              <div className="pokemon-modal-body">
                <p className="pokemon-modal-description">
                  {t('clicker.save.exportDescription')}
                </p>
                <textarea
                  className="pokemon-modal-textarea"
                  value={shareCode}
                  readOnly
                  rows={4}
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
                <button 
                  className={`pokemon-modal-btn primary ${copySuccess ? 'success' : ''}`}
                  onClick={handleCopyCode}
                >
                  {copySuccess ? t('clicker.save.exportCopied') : t('clicker.save.exportCopy')}
                </button>
                <div className="pokemon-modal-info">
                  {t('clicker.save.exportInfo')}
                </div>
              </div>
              <div className="pokemon-modal-footer">
                <button className="pokemon-modal-btn secondary" onClick={() => setShowExportModal(false)}>
                  {t('clicker.save.exportClose')}
                </button>
              </div>
            </div>
          </div>
        ),
        document.body
      )}

      {/* Import Modal */}
      {showImportModal && createPortal(
        (
          <div className="modal-overlay">
            <div className="pokemon-modal">
              <div className="pokemon-modal-header">
                <h3>{t('clicker.save.importTitle')}</h3>
                <button className="pokemon-modal-close" onClick={() => setShowImportModal(false)}>✕</button>
              </div>
              <div className="pokemon-modal-body">
                <p className="pokemon-modal-description">
                  {t('clicker.save.importDescription')}
                </p>
                <textarea
                  className="pokemon-modal-textarea"
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    setImportError(null);
                  }}
                  placeholder={t('clicker.save.importPlaceholder')}
                  rows={4}
                />
                {importError && (
                  <div className="pokemon-modal-error">{importError}</div>
                )}
                <div className="pokemon-modal-info">
                  {t('clicker.save.importInfo')}
                </div>
                <div className="pokemon-modal-warning">
                  {t('clicker.save.importWarning')}
                </div>
              </div>
              <div className="pokemon-modal-footer">
                <button className="pokemon-modal-btn secondary" onClick={() => setShowImportModal(false)}>
                  {t('clicker.save.importCancel')}
                </button>
                <button className="pokemon-modal-btn primary" onClick={handleImport}>
                  {t('clicker.save.importConfirm')}
                </button>
              </div>
            </div>
          </div>
        ),
        document.body
      )}
    </>
  );
});

HUD.displayName = 'HUD';
