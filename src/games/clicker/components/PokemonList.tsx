import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClickerContext, getHelperEffectiveBase } from '../context/ClickerContext';
import { getCurrentEvolution, getNextEvolution } from '../config/helpers';

const getAnimatedSprite = (pokemonId: number): string => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonId}.gif`;
};

const getStaticSprite = (pokemonId: number): string => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
};

const formatNumber = (num: number): string => {
  if (num >= 1e18) return (num / 1e18).toFixed(1) + 'Qi';
  if (num >= 1e15) return (num / 1e15).toFixed(1) + 'Qa';
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return Math.floor(num).toLocaleString();
};

export const PokemonList: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(ClickerContext);
  const [purchaseAnimation, setPurchaseAnimation] = useState<string | null>(null);
  const [evolvingHelper, setEvolvingHelper] = useState<string | null>(null);

  const handleBuy = (helperId: string) => {
    const helper = state.helpers.find(h => h.id === helperId);
    if (!helper) return;
    const nextEvolution = getNextEvolution(helper);
    const willEvolve = nextEvolution && helper.count + 1 >= nextEvolution.level;
    dispatch({ type: 'BUY_HELPER', payload: { helperId } });
    setPurchaseAnimation(helperId);
    if (willEvolve) {
      setEvolvingHelper(helperId);
      setTimeout(() => setEvolvingHelper(null), 1500);
    }
    setTimeout(() => setPurchaseAnimation(null), 500);
  };

  const totalHelpers = state.helpers.reduce((sum, h) => sum + h.count, 0);

  return (
    <div className="helpers-container">
      <div className="helpers-header">
        <h2 className="helpers-title">🎮 {t('clicker.helpers')}</h2>
        <div className="helpers-summary">
          <span className="summary-stat">{t('clicker.total')}: {totalHelpers}</span>
        </div>
      </div>
      <div className="helpers-list">
        {state.helpers.map((helper) => {
          const cost = Math.floor(helper.baseCost * Math.pow(1.15, helper.count));
          const canAfford = state.energy >= cost;
          // Use effective base (original + upgrades) for display
          const effectiveBase = getHelperEffectiveBase(helper, state.upgrades);
          const totalProduction = effectiveBase * helper.count;
          const hasBaseBonus = effectiveBase > helper.baseProduction;
          const isPurchasing = purchaseAnimation === helper.id;
          const isEvolving = evolvingHelper === helper.id;
          const currentEvolution = getCurrentEvolution(helper);
          const nextEvolution = getNextEvolution(helper);
          const evolutionProgress = nextEvolution ? Math.min(100, (helper.count / nextEvolution.level) * 100) : 100;

          return (
            <div key={helper.id} className={`helper-card ${isPurchasing ? 'purchasing' : ''} ${isEvolving ? 'evolving' : ''} ${helper.count > 0 ? 'owned' : ''}`}>
              <div className="helper-sprite-section">
                <div className="helper-sprite-container">
                  <img src={getAnimatedSprite(currentEvolution.pokemonId)} alt={currentEvolution.name} className={`helper-sprite ${isEvolving ? 'evolution-flash' : ''}`} onError={(e) => { (e.target as HTMLImageElement).src = getStaticSprite(currentEvolution.pokemonId); }} />
                  {isEvolving && <div className="evolution-effect"><span className="evo-text">EVOLUTION!</span></div>}
                </div>
                <div className="helper-count-display">
                  <span className="count-number">{helper.count}</span>
                  <span className="count-label">{t('clicker.owned')}</span>
                </div>
              </div>
              <div className="helper-info-section">
                <div className="helper-name-row">
                  <h3 className="helper-name">{currentEvolution.name}</h3>
                  {!nextEvolution && helper.evolutions && helper.evolutions.length > 0 && <span className="max-badge">MAX</span>}
                </div>
                <div className="helper-stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">{t('clicker.base')}</span>
                    <span className={`stat-value ${hasBaseBonus ? 'boosted' : ''}`}>
                      +{formatNumber(effectiveBase)}/s
                      {hasBaseBonus && <span className="bonus-indicator">↑</span>}
                    </span>
                  </div>
                  <div className="stat-item"><span className="stat-label">{t('clicker.total')}</span><span className="stat-value highlight">{helper.count > 0 ? `+${formatNumber(totalProduction)}/s` : '—'}</span></div>
                </div>
                <div className="evolution-section">
                  {nextEvolution ? (
                    <div className="evo-progress">
                      <div className="evo-bar"><div className="evo-fill" style={{ width: `${evolutionProgress}%` }} /></div>
                      <div className="evo-info"><span className="evo-arrow">→</span> <span className="evo-target">{nextEvolution.name}</span> <span className="evo-req">({helper.count}/{nextEvolution.level})</span></div>
                    </div>
                  ) : helper.evolutions && helper.evolutions.length > 0 ? (
                    <div className="fully-evolved">✨ {t('clicker.fullyEvolved')}</div>
                  ) : (
                    <div className="legendary">🌟 {t('clicker.legendary')}</div>
                  )}
                </div>
              </div>
              <div className="helper-buy-section">
                <button onClick={() => handleBuy(helper.id)} disabled={!canAfford} className={`helper-buy-btn ${canAfford ? 'can-afford' : ''}`}>
                  <span className="btn-label">{t('clicker.buy')}</span>
                  <span className="btn-cost">⚡ {formatNumber(cost)}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        .helpers-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .helpers-title { margin: 0; }
        .helpers-summary { display: flex; gap: 0.5rem; }
        .summary-stat { background: rgba(168,85,247,0.2); color: #a855f7; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
        .helper-card { display: grid; grid-template-columns: 90px 1fr 90px; gap: 0.75rem; padding: 1rem; background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; transition: all 0.2s ease; min-height: 130px; }
        .helper-card.owned { border-color: rgba(168,85,247,0.3); }
        .helper-card:hover { border-color: rgba(255,255,255,0.2); background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%); }
        .helper-card.purchasing { border-color: #4ade80; background: linear-gradient(135deg, rgba(74,222,128,0.2) 0%, rgba(0,0,0,0.1) 100%); }
        .helper-card.evolving { animation: evolve-glow 1.5s ease-out; }
        @keyframes evolve-glow { 0% { box-shadow: 0 0 20px rgba(168,85,247,0.5); } 50% { box-shadow: 0 0 60px rgba(236,72,153,0.8), 0 0 100px rgba(168,85,247,0.6); } 100% { box-shadow: 0 0 20px rgba(168,85,247,0.3); } }
        .helper-sprite-section { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        .helper-sprite-container { width: 70px; height: 70px; background: radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%); border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; }
        .helper-sprite { width: 56px; height: 56px; object-fit: contain; image-rendering: pixelated; animation: helperBounce 2s ease-in-out infinite; filter: drop-shadow(0 0 5px rgba(255,255,255,0.3)); }
        .helper-sprite.evolution-flash { animation: flash-white 1.5s ease-out; }
        @keyframes helperBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes flash-white { 0% { filter: brightness(1); } 25% { filter: brightness(3) saturate(0); } 50% { filter: brightness(5) saturate(0); } 75% { filter: brightness(2); } 100% { filter: brightness(1); } }
        .evolution-effect { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; }
        .evo-text { font-size: 0.6rem; font-weight: bold; color: #fff; text-shadow: 0 0 10px #a855f7, 0 0 20px #ec4899; animation: pulse-text 0.5s ease-in-out infinite; white-space: nowrap; }
        @keyframes pulse-text { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
        .helper-count-display { display: flex; flex-direction: column; align-items: center; gap: 0; }
        .count-number { font-size: 1.1rem; font-weight: 800; color: #a855f7; line-height: 1; }
        .count-label { font-size: 0.55rem; color: rgba(255,255,255,0.5); text-transform: uppercase; }
        .helper-info-section { display: flex; flex-direction: column; gap: 0.4rem; min-width: 0; }
        .helper-name-row { display: flex; align-items: center; gap: 0.5rem; }
        .helper-name { margin: 0; font-size: 0.95rem; font-weight: 700; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .max-badge { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #1a1a2e; font-size: 0.5rem; font-weight: 800; padding: 0.1rem 0.35rem; border-radius: 4px; flex-shrink: 0; }
        .helper-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; }
        .stat-item { display: flex; flex-direction: column; gap: 0; }
        .stat-label { font-size: 0.55rem; color: rgba(255,255,255,0.5); text-transform: uppercase; }
        .stat-value { font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.8); display: flex; align-items: center; gap: 0.25rem; }
        .stat-value.highlight { color: #4ade80; }
        .stat-value.boosted { color: #fbbf24; }
        .bonus-indicator { font-size: 0.6rem; color: #4ade80; animation: pulse-bonus 1s ease-in-out infinite; }
        @keyframes pulse-bonus { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .evolution-section { margin-top: auto; }
        .evo-progress { display: flex; flex-direction: column; gap: 0.2rem; }
        .evo-bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
        .evo-fill { height: 100%; background: linear-gradient(90deg, #a855f7, #ec4899); border-radius: 2px; transition: width 0.3s ease; }
        .evo-info { display: flex; align-items: center; gap: 0.25rem; font-size: 0.65rem; }
        .evo-arrow { color: #a855f7; }
        .evo-target { color: #ec4899; font-weight: 600; }
        .evo-req { color: rgba(255,255,255,0.5); }
        .fully-evolved { font-size: 0.7rem; color: #fbbf24; }
        .legendary { font-size: 0.7rem; color: #60a5fa; }
        .helper-buy-section { display: flex; align-items: center; justify-content: center; }
        .helper-buy-btn { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; padding: 0.6rem 0.5rem; background: linear-gradient(135deg, #3b4cca 0%, #2a3b9e 100%); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; transition: all 0.2s ease; min-width: 80px; }
        .helper-buy-btn:hover:not(:disabled) { opacity: 0.9; transform: scale(1.02); }
        .helper-buy-btn:disabled { background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%); cursor: not-allowed; opacity: 0.6; }
        .helper-buy-btn.can-afford { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); }
        .btn-label { font-size: 0.65rem; text-transform: uppercase; opacity: 0.8; }
        .btn-cost { font-size: 0.75rem; display: flex; align-items: center; gap: 0.2rem; }
      `}</style>
    </div>
  );
};