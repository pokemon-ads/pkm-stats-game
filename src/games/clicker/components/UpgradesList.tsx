import React, { useContext, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ClickerContext } from '../context/ClickerContext';
import type { Upgrade } from '../types/game';
import { Shop } from './Shop';

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

type MainTabType = 'shop' | 'upgrades';
type UpgradeSubTabType = 'available' | 'click' | 'global' | 'helper' | 'evolution' | 'purchased';

const MAIN_TABS: { id: MainTabType; labelKey: string; icon: string }[] = [
  { id: 'shop', labelKey: 'clicker.shop.title', icon: '🛒' },
  { id: 'upgrades', labelKey: 'clicker.upgrades.title', icon: '⚙️' },
];

const UPGRADE_SUB_TABS: { id: UpgradeSubTabType; labelKey: string; icon: string }[] = [
  { id: 'available', labelKey: 'clicker.upgrades.all', icon: '🎯' },
  { id: 'click', labelKey: 'clicker.upgrades.click', icon: '👆' },
  { id: 'global', labelKey: 'clicker.upgrades.global', icon: '🌍' },
  { id: 'helper', labelKey: 'clicker.upgrades.helpers', icon: '⚡' },
  { id: 'evolution', labelKey: 'clicker.upgrades.evolution', icon: '✨' },
  { id: 'purchased', labelKey: 'clicker.upgrades.owned', icon: '✅' },
];

export const UpgradesList: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(ClickerContext);
  const [activeMainTab, setActiveMainTab] = useState<MainTabType>('upgrades');
  const [activeSubTab, setActiveSubTab] = useState<UpgradeSubTabType>('available');

  // Create helper lookup map for O(1) access instead of O(n) find
  const helperMap = useMemo(() => {
    const map = new Map<string, number>();
    state.helpers.forEach(h => map.set(h.id, h.count));
    return map;
  }, [state.helpers]);

  const isUpgradeAvailable = useCallback((upgrade: Upgrade) => {
    if (upgrade.purchased) return false;
    if (!upgrade.condition) return true;

    switch (upgrade.condition.type) {
      case 'TOTAL_ENERGY':
        return state.totalEnergy >= upgrade.condition.amount;
      case 'HELPER_COUNT': {
        if (!upgrade.condition.targetId) return false;
        const helperCount = helperMap.get(upgrade.condition.targetId) ?? 0;
        return helperCount >= upgrade.condition.amount;
      }
      case 'EVOLUTION': {
        if (!upgrade.condition.targetId) return false;
        const helperEvoCount = helperMap.get(upgrade.condition.targetId) ?? 0;
        return helperEvoCount >= upgrade.condition.amount;
      }
      default:
        return true;
    }
  }, [state.totalEnergy, helperMap]);

  const handlePurchase = useCallback((upgradeId: string) => {
    dispatch({ type: 'BUY_UPGRADE', payload: { upgradeId } });
  }, [dispatch]);

  // Filter upgrades based on active sub tab
  const filteredUpgrades = useMemo(() => {
    const available = state.upgrades.filter(isUpgradeAvailable);
    const purchased = state.upgrades.filter(u => u.purchased);

    switch (activeSubTab) {
      case 'available':
        return available;
      case 'click':
        return available.filter(u => u.category === 'click');
      case 'global':
        return available.filter(u => u.category === 'global');
      case 'helper':
        return available.filter(u => u.category === 'helper');
      case 'evolution':
        return available.filter(u => u.category === 'evolution');
      case 'purchased':
        return purchased;
      default:
        return available;
    }
  }, [state.upgrades, isUpgradeAvailable, activeSubTab]);

  // Count available upgrades per category
  const counts = useMemo(() => {
    const available = state.upgrades.filter(isUpgradeAvailable);
    return {
      available: available.length,
      click: available.filter(u => u.category === 'click').length,
      global: available.filter(u => u.category === 'global').length,
      helper: available.filter(u => u.category === 'helper').length,
      evolution: available.filter(u => u.category === 'evolution').length,
      purchased: state.upgrades.filter(u => u.purchased).length,
    };
  }, [state.upgrades, isUpgradeAvailable]);

  // Reset sub tab when switching main tabs
  const handleMainTabChange = useCallback((tab: MainTabType) => {
    setActiveMainTab(tab);
    if (tab === 'upgrades') {
      setActiveSubTab('available');
    }
  }, []);

  return (
    <div className="upgrades-panel">
      {/* Main Tab Navigation */}
      <div className="main-tabs">
        {MAIN_TABS.map(tab => (
          <button
            key={tab.id}
            className={`main-tab ${activeMainTab === tab.id ? 'active' : ''}`}
            onClick={() => handleMainTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{t(tab.labelKey)}</span>
          </button>
        ))}
      </div>

      {/* Sub Tab Navigation (only for upgrades) */}
      {activeMainTab === 'upgrades' && (
        <div className="sub-tabs">
          {UPGRADE_SUB_TABS.map(tab => (
            <button
              key={tab.id}
              className={`sub-tab ${activeSubTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{t(tab.labelKey)}</span>
              {counts[tab.id] > 0 && (
                <span className="tab-count">{counts[tab.id]}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="upgrades-list">
        {activeMainTab === 'shop' ? (
          <Shop />
        ) : filteredUpgrades.length === 0 ? (
          <div className="no-upgrades">
            {activeSubTab === 'purchased' ? (
              <p>🔒 {t('clicker.upgrades.noPurchased')}</p>
            ) : (
              <p>🎮 {t('clicker.upgrades.keepPlaying')}</p>
            )}
          </div>
        ) : (
          filteredUpgrades.map(upgrade => {
            const canAfford = state.energy >= upgrade.cost;
            const isPurchased = upgrade.purchased;
            
            return (
              <div
                key={upgrade.id}
                className={`upgrade-item ${canAfford && !isPurchased ? 'affordable' : ''} ${isPurchased ? 'purchased' : ''} ${!canAfford && !isPurchased ? 'locked' : ''} ${upgrade.category === 'evolution' ? 'evolution-upgrade' : ''}`}
                onClick={() => {
                  if (canAfford && !isPurchased) {
                    handlePurchase(upgrade.id);
                  }
                }}
              >
                <div className={`upgrade-icon-wrapper ${upgrade.category === 'evolution' ? 'evolution-icon' : ''}`}>
                  {upgrade.icon && upgrade.icon.startsWith('http') ? (
                    <img 
                      src={upgrade.icon} 
                      alt={upgrade.name}
                      className="upgrade-icon-image"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = document.createElement('span');
                        fallback.className = 'upgrade-icon';
                        fallback.textContent = '✨';
                        e.currentTarget.parentElement?.appendChild(fallback);
                      }}
                    />
                  ) : (
                    <span className="upgrade-icon">{upgrade.icon || '✨'}</span>
                  )}
                </div>
                <div className="upgrade-content">
                  <div className="upgrade-header">
                    <span className="upgrade-name">{upgrade.name}</span>
                    <span className={`upgrade-multiplier ${upgrade.category === 'evolution' ? 'evolution-multiplier' : ''}`}>x{upgrade.value}</span>
                  </div>
                  <div className="upgrade-desc">{upgrade.description}</div>
                  {upgrade.category === 'evolution' && upgrade.condition?.evolutionName && (
                    <div className="evolution-requirement">
                      🔓 {t('clicker.upgrades.requires')}: {upgrade.condition.evolutionName}
                    </div>
                  )}
                </div>
                <div className="upgrade-price">
                  {isPurchased ? (
                    <span className="owned-badge">✓</span>
                  ) : (
                    <span className={`price ${canAfford ? 'can-afford' : 'too-expensive'}`}>
                      ⚡{formatNumber(upgrade.cost)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .upgrades-panel {
          background: linear-gradient(135deg, rgba(255, 203, 5, 0.1) 0%, rgba(59, 76, 202, 0.1) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 203, 5, 0.2);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .main-tabs {
          display: flex;
          gap: 8px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .main-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .main-tab:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .main-tab.active {
          background: linear-gradient(135deg, rgba(255, 203, 5, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%);
          border-color: rgba(255, 203, 5, 0.5);
          color: white;
          box-shadow: 0 2px 8px rgba(255, 203, 5, 0.2);
        }

        .sub-tabs {
          display: flex;
          gap: 4px;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          overflow-x: auto;
          flex-shrink: 0;
        }

        .sub-tabs::-webkit-scrollbar {
          height: 4px;
        }

        .sub-tabs::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }

        .sub-tab {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .sub-tab:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .sub-tab.active {
          background: linear-gradient(135deg, rgba(59, 76, 202, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%);
          border-color: rgba(59, 76, 202, 0.5);
          color: white;
        }

        .tab-icon {
          font-size: 1rem;
        }

        .tab-label {
          display: none;
        }

        @media (min-width: 400px) {
          .tab-label {
            display: inline;
          }
        }

        .tab-count {
          background: rgba(255, 203, 5, 0.3);
          color: #ffcb05;
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 0.65rem;
          font-weight: 700;
        }

        .upgrades-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .upgrades-list::-webkit-scrollbar {
          width: 6px;
        }

        .upgrades-list::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        .upgrades-list::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 3px;
        }

        .no-upgrades {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.9rem;
        }

        .upgrade-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 60px;
        }

        .upgrade-item.affordable {
          border-color: rgba(74, 222, 128, 0.5);
          background: rgba(74, 222, 128, 0.1);
        }

        .upgrade-item.affordable:hover {
          background: rgba(74, 222, 128, 0.2);
          border-color: rgba(74, 222, 128, 0.7);
        }

        .upgrade-item.purchased {
          opacity: 0.6;
          cursor: default;
          background: rgba(74, 222, 128, 0.05);
          border-color: rgba(74, 222, 128, 0.2);
        }

        .upgrade-item.locked {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .upgrade-icon-wrapper {
          width: 40px;
          height: 40px;
          min-width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          font-size: 1.3rem;
          overflow: hidden;
        }

        .upgrade-icon-image {
          width: 32px;
          height: 32px;
          object-fit: contain;
          image-rendering: pixelated;
        }

        .upgrade-item-image {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .upgrade-content {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }

        .upgrade-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }

        .upgrade-name {
          font-weight: 700;
          font-size: 0.85rem;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .upgrade-multiplier {
          font-size: 0.7rem;
          font-weight: 700;
          color: #ffcb05;
          background: rgba(255, 203, 5, 0.2);
          padding: 2px 6px;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .upgrade-desc {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .upgrade-price {
          flex-shrink: 0;
          min-width: 70px;
          text-align: right;
        }

        .price {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 8px;
        }

        .price.can-afford {
          color: #4ade80;
          background: rgba(74, 222, 128, 0.2);
        }

        .price.too-expensive {
          color: #f87171;
          background: rgba(248, 113, 113, 0.2);
        }

        .owned-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
          color: white;
          border-radius: 50%;
          font-size: 0.9rem;
          font-weight: 700;
        }

        /* Evolution upgrade special styles */
        .upgrade-item.evolution-upgrade {
          border-color: rgba(168, 85, 247, 0.4);
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
        }

        .upgrade-item.evolution-upgrade.affordable {
          border-color: rgba(168, 85, 247, 0.7);
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
          animation: evolution-glow 2s ease-in-out infinite;
        }

        @keyframes evolution-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(168, 85, 247, 0.3); }
          50% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.5), 0 0 30px rgba(236, 72, 153, 0.3); }
        }

        .evolution-icon {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%) !important;
        }

        .evolution-multiplier {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%) !important;
          color: #e879f9 !important;
        }

        .evolution-requirement {
          font-size: 0.6rem;
          color: #a855f7;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
};