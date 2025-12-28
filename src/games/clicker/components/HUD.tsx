import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useClickerGame } from '../hooks/useClickerGame';
import { AVAILABLE_BOOSTS } from '../config/boosts';

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
  const { state, resetGame, exportSave, importSave } = useClickerGame();
  const [prevEnergy, setPrevEnergy] = useState(state.energy);
  const [isGaining, setIsGaining] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [shareCode, setShareCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Animate energy changes
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9a77cddd-fb46-4bc0-be08-45e0027b17d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HUD.tsx:31',message:'HUD energy effect triggered',data:{energy:state.energy,prevEnergy},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
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
      // Fallback: select text
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
    
    // Remove any whitespace/newlines from the code
    saveData = saveData.replace(/\s/g, '');
    
    // Try to decode base64 code
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
      // Optionnel: recharger la page pour s'assurer que tout est synchronisé
      window.location.reload();
    } else {
      setImportError(t('clicker.save.importFailed'));
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
      // eslint-disable-next-line react-hooks/purity
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
    <>
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
          <div className="active-boosts-label">{t('clicker.shop.activeBoosts')}:</div>
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
        <div className="hud-action-buttons">
          <button className="hud-export-btn-mini" onClick={handleExportAsCode} title={t('clicker.save.exportButton')}>
            🔗
          </button>
          <button className="hud-import-btn-mini" onClick={() => setShowImportModal(true)} title={t('clicker.save.importButton')}>
            📥
          </button>
          <button className="hud-reset-btn-mini" onClick={handleReset} title={t('clicker.resetProgress')}>
            🔄
          </button>
        </div>
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

        .hud-action-buttons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .hud-export-btn-mini,
        .hud-import-btn-mini {
          width: 32px;
          height: 32px;
          min-width: 32px;
          padding: 0;
          background: rgba(59, 130, 246, 0.3);
          color: white;
          border: 1px solid rgba(59, 130, 246, 0.5);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hud-export-btn-mini:hover,
        .hud-import-btn-mini:hover {
          background: rgba(59, 130, 246, 0.5);
          border-color: rgba(59, 130, 246, 0.8);
        }

        .import-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          backdrop-filter: blur(4px);
        }

        .import-modal {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.95) 0%, rgba(59, 76, 202, 0.95) 100%);
          border: 2px solid rgba(168, 85, 247, 0.5);
          border-radius: 20px;
          padding: 0;
          max-width: 800px;
          width: 90%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        .import-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .import-modal-header h3 {
          margin: 0;
          color: white;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .import-modal-close {
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .import-modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .import-modal-body {
          padding: 1.5rem;
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .import-modal-description {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .import-modal-textarea {
          width: 100%;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          color: white;
          font-family: monospace;
          font-size: 0.9rem;
          resize: none;
          min-height: 300px;
          max-height: 400px;
          box-sizing: border-box;
        }

        .import-modal-textarea:focus {
          outline: none;
          border-color: rgba(168, 85, 247, 0.8);
        }

        .import-modal-textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .import-modal-error {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.3);
          border: 1px solid rgba(239, 68, 68, 0.5);
          border-radius: 10px;
          color: white;
          font-size: 0.9rem;
        }

        .import-modal-warning {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(255, 193, 7, 0.2);
          border: 1px solid rgba(255, 193, 7, 0.4);
          border-radius: 10px;
          color: #ffc107;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .import-modal-footer {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          justify-content: flex-end;
        }

        .import-modal-cancel,
        .import-modal-confirm {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .import-modal-cancel {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .import-modal-cancel:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .import-modal-confirm {
          background: rgba(34, 197, 94, 0.8);
          color: white;
        }

        .import-modal-confirm:hover {
          background: rgba(34, 197, 94, 1);
        }

        .export-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          backdrop-filter: blur(4px);
        }

        .export-modal {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.95) 0%, rgba(59, 76, 202, 0.95) 100%);
          border: 2px solid rgba(168, 85, 247, 0.5);
          border-radius: 20px;
          padding: 0;
          max-width: 700px;
          width: 90%;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        .export-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .export-modal-header h3 {
          margin: 0;
          color: white;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .export-modal-close {
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .export-modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .export-modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .export-modal-description {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .export-modal-code-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .export-modal-code {
          width: 100%;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          color: white;
          font-family: monospace;
          font-size: 0.75rem;
          resize: vertical;
          min-height: 120px;
          box-sizing: border-box;
          word-break: break-all;
          cursor: text;
        }

        .export-modal-code:focus {
          outline: none;
          border-color: rgba(168, 85, 247, 0.8);
        }

        .export-modal-copy-btn {
          margin-top: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: rgba(34, 197, 94, 0.8);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .export-modal-copy-btn:hover {
          background: rgba(34, 197, 94, 1);
        }

        .export-modal-copy-btn.success {
          background: rgba(34, 197, 94, 1);
        }

        .export-modal-info {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.4);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.85rem;
        }

        .export-modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .export-modal-close-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .export-modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .import-modal-info {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.4);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.85rem;
        }
      `}</style>
      </div>

      {/* Export Modal */}
      {showExportModal && createPortal(
        (
          <div className="export-modal-overlay" onClick={() => setShowExportModal(false)}>
            <div className="export-modal" onClick={(e) => e.stopPropagation()}>
              <div className="export-modal-header">
                <h3>{t('clicker.save.exportTitle')}</h3>
                <button className="export-modal-close" onClick={() => setShowExportModal(false)}>×</button>
              </div>
              <div className="export-modal-body">
                <p className="export-modal-description">
                  {t('clicker.save.exportDescription')}
                </p>
                <div className="export-modal-code-container">
                  <textarea
                    className="export-modal-code"
                    value={shareCode}
                    readOnly
                    rows={6}
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  />
                  <button 
                    className={`export-modal-copy-btn ${copySuccess ? 'success' : ''}`}
                    onClick={handleCopyCode}
                  >
                    {copySuccess ? t('clicker.save.exportCopied') : t('clicker.save.exportCopy')}
                  </button>
                </div>
                <div className="export-modal-info">
                  {t('clicker.save.exportInfo')}
                </div>
              </div>
              <div className="export-modal-footer">
                <button className="export-modal-close-btn" onClick={() => setShowExportModal(false)}>
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
          <div className="import-modal-overlay">
            <div className="import-modal">
              <div className="import-modal-header">
                <h3>{t('clicker.save.importTitle')}</h3>
                <button className="import-modal-close" onClick={() => setShowImportModal(false)}>×</button>
              </div>
              <div className="import-modal-body">
                <p className="import-modal-description">
                  {t('clicker.save.importDescription')}
                </p>
                <textarea
                  className="import-modal-textarea"
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    setImportError(null);
                  }}
                  placeholder={t('clicker.save.importPlaceholder')}
                />
                {importError && (
                  <div className="import-modal-error">{importError}</div>
                )}
                <div className="import-modal-info">
                  {t('clicker.save.importInfo')}
                </div>
                <div className="import-modal-warning">
                  {t('clicker.save.importWarning')}
                </div>
              </div>
              <div className="import-modal-footer">
                <button className="import-modal-cancel" onClick={() => setShowImportModal(false)}>
                  {t('clicker.save.importCancel')}
                </button>
                <button className="import-modal-confirm" onClick={handleImport}>
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
};