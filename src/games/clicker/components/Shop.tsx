import React, { useContext, useMemo, useCallback, useState, useEffect } from 'react';
import { ClickerContext } from '../context/ClickerContext';
import { AVAILABLE_BOOSTS, calculateBoostCost } from '../config/boosts';
import { ITEM_CATEGORIES, CATEGORY_INFO, type ItemCategory } from '../utils/itemSprites';
import type { Boost, Upgrade } from '../types/game';
import '../styles/Shop.css';

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

// Format time remaining
const formatTime = (seconds: number): string => {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h${m}m`;
  }
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  return `0:${seconds.toString().padStart(2, '0')}`;
};

// Get item category for styling
const getItemCategory = (iconUrl?: string): ItemCategory => {
  if (!iconUrl) return 'held';
  const itemName = iconUrl.split('/').pop()?.replace('.png', '') || '';
  return ITEM_CATEGORIES[itemName] || 'held';
};

// Get Pokemon sprite URL
const getPokemonSpriteUrl = (pokemonId: number): string => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
};

type ShopItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon?: string;
  type: 'boost' | 'upgrade';
  category?: string;
  boostData?: Boost;
  upgradeData?: Upgrade;
  isActive?: boolean;
  cooldownRemaining?: number;
  activeRemaining?: number;
  targetPokemonId?: number;
  targetPokemonName?: string;
};

export const Shop: React.FC = () => {
  const { state, dispatch } = useContext(ClickerContext);
  const [selectedBox, setSelectedBox] = useState<'consumables' | 'equipment' | 'special'>('consumables');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{ item: ShopItem; slotIndex: number; rect: DOMRect } | null>(null);
  const [purchaseEffect, setPurchaseEffect] = useState<string | null>(null);
  
  // Force update for timers
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setForceUpdate(n => n + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Map helper IDs to Pokemon IDs
  const helperPokemonMap = useMemo(() => {
    const map: Record<string, { pokemonId: number; name: string }> = {};
    state.helpers.forEach(h => {
      if (h.pokemonId) {
        map[h.id] = { pokemonId: h.pokemonId, name: h.name };
      }
    });
    return map;
  }, [state.helpers]);

  // --- ACTIONS ---
  const handlePurchaseBoost = useCallback((boostId: string) => {
    const boost = AVAILABLE_BOOSTS.find(b => b.id === boostId);
    if (!boost) return;
    
    const cost = calculateBoostCost(boost, state.energyPerSecond);
    const cooldown = state.boostCooldowns.find(c => c.boostId === boostId);
    const isOnCooldown = cooldown && Date.now() < cooldown.availableAt;
    const isActive = state.activeBoosts.some(b => b.boostId === boostId && b.expiresAt > Date.now());
    
    if (state.energy < cost || isOnCooldown || isActive) return;
    
    setPurchaseEffect(boostId);
    setTimeout(() => setPurchaseEffect(null), 500);
    dispatch({ type: 'ACTIVATE_BOOST', payload: { boostId } });
  }, [dispatch, state.energy, state.energyPerSecond, state.boostCooldowns, state.activeBoosts]);

  const handlePurchaseUpgrade = useCallback((upgradeId: string) => {
    const upgrade = state.upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.purchased || state.energy < upgrade.cost) return;
    
    setPurchaseEffect(upgradeId);
    setTimeout(() => setPurchaseEffect(null), 500);
    dispatch({ type: 'BUY_UPGRADE', payload: { upgradeId } });
  }, [dispatch, state.energy, state.upgrades]);

  // --- HELPERS ---
  const getCooldownRemaining = useCallback((boost: Boost): number => {
    const cooldown = state.boostCooldowns.find(c => c.boostId === boost.id);
    if (cooldown && Date.now() < cooldown.availableAt) {
      return Math.ceil((cooldown.availableAt - Date.now()) / 1000);
    }
    return 0;
  }, [state.boostCooldowns]);

  const getActiveBoostRemaining = useCallback((boostId: string): number => {
    const activeBoost = state.activeBoosts.find(b => b.boostId === boostId);
    if (activeBoost && activeBoost.expiresAt > Date.now()) {
      return Math.ceil((activeBoost.expiresAt - Date.now()) / 1000);
    }
    return 0;
  }, [state.activeBoosts]);

  // --- DATA PREP ---
  const boostItems: ShopItem[] = useMemo(() => {
    return AVAILABLE_BOOSTS.map(boost => ({
      id: boost.id,
      name: boost.name,
      description: boost.description,
      cost: calculateBoostCost(boost, state.energyPerSecond),
      icon: boost.icon,
      type: 'boost' as const,
      category: boost.type,
      boostData: boost,
      isActive: getActiveBoostRemaining(boost.id) > 0,
      cooldownRemaining: getCooldownRemaining(boost),
      activeRemaining: getActiveBoostRemaining(boost.id),
    }));
  }, [state.energyPerSecond, getCooldownRemaining, getActiveBoostRemaining]);

  const upgradeItems: ShopItem[] = useMemo(() => {
    return state.upgrades
      .filter(u => !u.purchased)
      .slice(0, 30)
      .map(upgrade => {
        const targetHelper = upgrade.targetId ? helperPokemonMap[upgrade.targetId] : null;
        return {
          id: upgrade.id,
          name: upgrade.name,
          description: upgrade.description,
          cost: upgrade.cost,
          icon: upgrade.icon,
          type: 'upgrade' as const,
          category: upgrade.category,
          upgradeData: upgrade,
          targetPokemonId: targetHelper?.pokemonId,
          targetPokemonName: targetHelper?.name,
        };
      });
  }, [state.upgrades, helperPokemonMap]);

  const evolutionItems: ShopItem[] = useMemo(() => {
    return state.upgrades
      .filter(u => !u.purchased && u.category === 'evolution')
      .map(upgrade => {
        const targetHelper = upgrade.targetId ? helperPokemonMap[upgrade.targetId] : null;
        return {
          id: upgrade.id,
          name: upgrade.name,
          description: upgrade.description,
          cost: upgrade.cost,
          icon: upgrade.icon,
          type: 'upgrade' as const,
          category: 'evolution',
          upgradeData: upgrade,
          targetPokemonId: targetHelper?.pokemonId,
          targetPokemonName: targetHelper?.name,
        };
      });
  }, [state.upgrades, helperPokemonMap]);

  const activeBoosts = useMemo(() => {
    return state.activeBoosts
      .filter(ab => ab.expiresAt > Date.now())
      .map(ab => {
        const boostDef = AVAILABLE_BOOSTS.find(b => b.id === ab.boostId);
        return {
          ...ab,
          def: boostDef,
          remaining: Math.ceil((ab.expiresAt - Date.now()) / 1000),
          progress: boostDef ? ((ab.expiresAt - Date.now()) / (boostDef.duration * 1000)) * 100 : 0,
        };
      });
  }, [state.activeBoosts]);

  // Get current box items
  const currentItems = useMemo(() => {
    switch (selectedBox) {
      case 'consumables': return boostItems;
      case 'equipment': return upgradeItems.filter(u => u.category !== 'evolution');
      case 'special': return evolutionItems;
      default: return [];
    }
  }, [selectedBox, boostItems, upgradeItems, evolutionItems]);

  // Pad items to fill grid (6 columns x 5 rows = 30 slots)
  const gridItems = useMemo(() => {
    const items = [...currentItems];
    while (items.length < 30) {
      items.push(null as unknown as ShopItem);
    }
    return items.slice(0, 30);
  }, [currentItems]);

  // Handle purchase (for button and double-click)
  const handleBuy = useCallback((item: ShopItem) => {
    if (!item) return;
    
    const canAfford = state.energy >= item.cost;
    const isDisabled = item.type === 'boost' && (item.isActive || (item.cooldownRemaining ?? 0) > 0);
    
    if (!canAfford || isDisabled) return;
    
    if (item.type === 'boost') {
      handlePurchaseBoost(item.id);
    } else {
      handlePurchaseUpgrade(item.id);
    }
  }, [state.energy, handlePurchaseBoost, handlePurchaseUpgrade]);

  // Handle slot double-click
  const handleDoubleClick = useCallback((item: ShopItem | null) => {
    if (item) {
      handleBuy(item);
    }
  }, [handleBuy]);

  // Handle hover for tooltip
  const handleMouseEnter = useCallback((item: ShopItem, slotIndex: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredItem({ item, slotIndex, rect });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);

  const canAfford = selectedItem ? state.energy >= selectedItem.cost : false;
  const isDisabled = selectedItem?.type === 'boost' && (selectedItem.isActive || (selectedItem.cooldownRemaining ?? 0) > 0);

  return (
    <div className="pc-container">

      {/* PC Screen Frame */}
      <div className="pc-screen">
        {/* Top Bar - Box Selection */}
        <div className="pc-topbar">
          <div className="pc-title">
            <span className="pc-icon">📦</span>
            <span>BOÎTE OBJETS</span>
          </div>
          <div className="box-tabs">
            <button 
              className={`box-tab ${selectedBox === 'consumables' ? 'active' : ''}`}
              onClick={() => { setSelectedBox('consumables'); setSelectedItem(null); }}
            >
              <span className="tab-dot" style={{ background: '#22c55e' }}></span>
              Conso.
            </button>
            <button 
              className={`box-tab ${selectedBox === 'equipment' ? 'active' : ''}`}
              onClick={() => { setSelectedBox('equipment'); setSelectedItem(null); }}
            >
              <span className="tab-dot" style={{ background: '#3b82f6' }}></span>
              Équip.
            </button>
            <button 
              className={`box-tab ${selectedBox === 'special' ? 'active' : ''}`}
              onClick={() => { setSelectedBox('special'); setSelectedItem(null); }}
            >
              <span className="tab-dot" style={{ background: '#a855f7' }}></span>
              Spécial
            </button>
          </div>
        </div>

        {/* Active Boosts Status Bar */}
        {activeBoosts.length > 0 && (
          <div className="status-bar">
            <span className="status-label">ACTIFS:</span>
            <div className="status-items">
              {activeBoosts.map(ab => (
                <div key={ab.boostId} className="status-item">
                  {ab.def?.icon && <img src={ab.def.icon} alt="" className="status-icon" />}
                  <div className="status-timer">
                    <div className="timer-fill" style={{ width: `${ab.progress}%` }}></div>
                    <span className="timer-text">{formatTime(ab.remaining)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Grid Area - PC Box Style */}
        <div className="pc-box">
          <div className="box-grid">
            {gridItems.map((item, index) => {
              const category = item ? getItemCategory(item.icon) : null;
              const categoryInfo = category ? CATEGORY_INFO[category] : null;
              const isSelected = selectedItem?.id === item?.id;
              const isPurchasing = purchaseEffect === item?.id;
              const itemCanAfford = item ? state.energy >= item.cost : false;
              const hasPokemon = item?.targetPokemonId;
              
              return (
                <div
                  key={item?.id || `empty-${index}`}
                  className={`box-slot ${item ? 'has-item' : 'empty'} ${isSelected ? 'selected' : ''} ${isPurchasing ? 'purchasing' : ''} ${item?.isActive ? 'active-boost' : ''} ${item && itemCanAfford ? 'affordable' : ''} ${hasPokemon ? 'has-pokemon' : ''}`}
                  onClick={() => item && setSelectedItem(item)}
                  onDoubleClick={() => handleDoubleClick(item)}
                  onMouseEnter={(e) => item && handleMouseEnter(item, index, e)}
                  onMouseLeave={handleMouseLeave}
                  style={categoryInfo ? { '--slot-color': categoryInfo.color } as React.CSSProperties : undefined}
                >
                  {item ? (
                    <>
                      <div className="slot-bg" style={{ borderColor: categoryInfo?.color }}></div>
                      
                      {/* Pokemon sprite in background */}
                      {item.targetPokemonId && (
                        <img 
                          src={getPokemonSpriteUrl(item.targetPokemonId)} 
                          alt="" 
                          className="slot-pokemon-bg"
                        />
                      )}
                      
                      {/* Item sprite */}
                      {item.icon && (
                        <img 
                          src={item.icon} 
                          alt={item.name} 
                          className={`slot-sprite ${item.targetPokemonId ? 'with-pokemon' : ''}`}
                        />
                      )}
                      
                      {/* Status indicators */}
                      {item.isActive && (
                        <div className="slot-status active">
                          <span>{formatTime(item.activeRemaining || 0)}</span>
                        </div>
                      )}
                      {!item.isActive && (item.cooldownRemaining ?? 0) > 0 && (
                        <div className="slot-status cooldown">
                          <span>⏳</span>
                        </div>
                      )}
                      {itemCanAfford && !item.isActive && !(item.cooldownRemaining ?? 0) && (
                        <div className="slot-indicator available"></div>
                      )}

                    </>
                  ) : (
                    <div className="slot-empty-bg"></div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Box Label */}
          <div className="box-label">
            <span className="box-name">
              {selectedBox === 'consumables' && '🧪 Consommables'}
              {selectedBox === 'equipment' && '🎒 Équipement'}
              {selectedBox === 'special' && '✨ Évolution'}
            </span>
            <span className="box-count">{currentItems.length}/30</span>
          </div>
        </div>

        {/* Bottom Panel - Item Details */}
        <div className="pc-info-panel">
          {selectedItem ? (
            <>
              <div className="info-left">
                <div className="info-sprite-frame">
                  {selectedItem.targetPokemonId && (
                    <img 
                      src={getPokemonSpriteUrl(selectedItem.targetPokemonId)} 
                      alt="" 
                      className="info-pokemon-bg"
                    />
                  )}
                  {selectedItem.icon && (
                    <img src={selectedItem.icon} alt={selectedItem.name} className="info-sprite" />
                  )}
                </div>
              </div>
              
              <div className="info-center">
                <div className="info-name">{selectedItem.name}</div>
                {selectedItem.targetPokemonName && (
                  <div className="info-target">🎯 {selectedItem.targetPokemonName}</div>
                )}
                <div className="info-desc">{selectedItem.description}</div>
                {selectedItem.type === 'boost' && selectedItem.boostData && (
                  <div className="info-stats">
                    <span>⏱ {formatTime(selectedItem.boostData.duration)}</span>
                    <span>🔄 {formatTime(selectedItem.boostData.cooldown)}</span>
                    <span>✕{selectedItem.boostData.value}</span>
                  </div>
                )}
                {selectedItem.type === 'upgrade' && selectedItem.upgradeData?.category && (
                  <div className="info-category">
                    {CATEGORY_INFO[getItemCategory(selectedItem.icon)]?.icon} {selectedItem.upgradeData.category}
                  </div>
                )}
              </div>
              
              <div className="info-right">
                <div className={`info-price ${!canAfford ? 'expensive' : ''}`}>
                  <span className="price-label">PRIX</span>
                  <span className="price-value">
                    <span className="energy-icon">⚡</span>
                    {formatNumber(selectedItem.cost)}
                  </span>
                </div>
                
                <button
                  className={`buy-button ${canAfford && !isDisabled ? 'can-buy' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => handleBuy(selectedItem)}
                  disabled={!canAfford || isDisabled}
                >
                  {selectedItem.isActive ? 'ACTIF' : (selectedItem.cooldownRemaining ?? 0) > 0 ? 'ATTENTE' : 'ACHETER'}
                </button>
              </div>
            </>
          ) : (
            <div className="info-empty">
              <span className="empty-icon">👆</span>
              <span className="empty-text">Sélectionnez un objet</span>
            </div>
          )}
        </div>

        {/* Energy Display */}
        <div className="pc-energy">
          <span className="energy-label">ÉNERGIE</span>
          <span className="energy-value">
            <span className="energy-bolt">⚡</span>
            {formatNumber(state.energy)}
          </span>
        </div>
      </div>

      {/* PC Frame Decorations */}
      <div className="pc-frame-top"></div>
      <div className="pc-frame-bottom"></div>
      <div className="pc-led"></div>

      {/* Tooltip - Fixed position */}
      {hoveredItem && (
        <div 
          className={`slot-tooltip ${hoveredItem.slotIndex < 6 ? 'tooltip-below' : ''}`}
          style={{
            position: 'fixed',
            left: hoveredItem.rect.left + hoveredItem.rect.width / 2,
            top: hoveredItem.slotIndex < 6 
              ? hoveredItem.rect.bottom + 8 
              : hoveredItem.rect.top - 8,
          }}
        >
          <div className="tooltip-header">
            {hoveredItem.item.targetPokemonId && (
              <img 
                src={getPokemonSpriteUrl(hoveredItem.item.targetPokemonId)} 
                alt="" 
                className="tooltip-pokemon"
              />
            )}
            <div className="tooltip-title-area">
              <span className="tooltip-name">{hoveredItem.item.name}</span>
              {hoveredItem.item.targetPokemonName && (
                <span className="tooltip-target">Pour {hoveredItem.item.targetPokemonName}</span>
              )}
            </div>
          </div>
          <div className="tooltip-desc">{hoveredItem.item.description}</div>
          {hoveredItem.item.type === 'boost' && hoveredItem.item.boostData && (
            <div className="tooltip-stats">
              <span>⏱ {formatTime(hoveredItem.item.boostData.duration)}</span>
              <span>🔄 {formatTime(hoveredItem.item.boostData.cooldown)}</span>
              <span>✕{hoveredItem.item.boostData.value}</span>
            </div>
          )}
          <div className="tooltip-price">
            <span className={state.energy >= hoveredItem.item.cost ? 'affordable' : 'expensive'}>
              ⚡ {formatNumber(hoveredItem.item.cost)}
            </span>
          </div>
          <div className="tooltip-hint">Double-clic pour acheter</div>
        </div>
      )}
    </div>
  );
};
