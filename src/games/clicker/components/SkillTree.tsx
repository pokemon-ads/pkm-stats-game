import React, { useContext, useMemo, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClickerContext } from '../context/ClickerContext';
import { getSkillTree, createSkillTrees, canUnlockSkill } from '../config/skill-trees';
import { getCurrentEvolution } from '../config/helpers';
import type { PokemonHelper } from '../types/game';
import '../styles/SkillTree.css';

// --- CONSTANTS ---
const GRID_SIZE_X = 180;
const GRID_SIZE_Y = 140;

// --- SPRITE HELPERS ---
const getAnimatedSprite = (pokemonId: number, isShiny: boolean = false): string => {
  if (isShiny) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/${pokemonId}.gif`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonId}.gif`;
};

const getStaticSprite = (pokemonId: number, isShiny: boolean = false): string => {
  if (isShiny) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
};

interface SkillTreeProps {
  helper: PokemonHelper;
  onClose: () => void;
}

export const SkillTree: React.FC<SkillTreeProps> = ({ helper, onClose }) => {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(ClickerContext);
  
  const [offset, setOffset] = useState({ x: 0, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  
  const viewportRef = useRef<HTMLDivElement>(null);

  const skillTree = useMemo(() => {
    const allHelperIds = state.helpers.map(h => h.id);
    const skillTrees = createSkillTrees(allHelperIds);
    return getSkillTree(helper.id, skillTrees);
  }, [helper.id, state.helpers]);

  if (!skillTree) {
    return (
      <div className="poke-skill-modal">
        <button className="poke-close-btn" onClick={onClose}>✕</button>
        <div className="poke-empty-state">
          <div className="poke-empty-icon">?</div>
          <p>{t('clicker.skillTree.noSkillTree')}</p>
        </div>
      </div>
    );
  }

  const selectedSkill = useMemo(() => 
    skillTree.skills.find(s => s.id === selectedSkillId),
  [skillTree, selectedSkillId]);

  const currentEvolution = useMemo(() => getCurrentEvolution(helper), [helper]);

  // Calculate EV spent
  const evSpent = useMemo(() => {
    let spent = 0;
    for (const skillId of helper.unlockedSkills) {
      const skill = skillTree.skills.find(s => s.id === skillId);
      if (skill) spent += skill.cost;
    }
    return spent;
  }, [helper.unlockedSkills, skillTree.skills]);

  const evRemaining = Math.max(0, helper.ev - evSpent);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (viewportRef.current) {
      const vw = viewportRef.current.clientWidth;
      const vh = viewportRef.current.clientHeight;
      setOffset({ x: vw / 2 - GRID_SIZE_X, y: vh * 0.15 });
    }
  }, []);

  const handleUnlock = (skillId: string) => {
    dispatch({ type: 'UNLOCK_SKILL', payload: { helperId: helper.id, skillId } });
  };

  const formatNum = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return Math.floor(num).toLocaleString();
  };

  // Get skill icon based on type
  const getSkillIcon = (skill: typeof skillTree.skills[0]) => {
    if (skill.name.includes("Légende") || skill.name.includes("Ultime") || skill.name.includes("Ascension")) return "⭐";
    if (skill.type === 'PRODUCTION_MULTIPLIER') return "⚡";
    if (skill.type === 'PRODUCTION_BONUS') return "➕";
    return "◆";
  };

  // Get rarity based on skill
  const getSkillRarity = (skill: typeof skillTree.skills[0]) => {
    if (skill.name.includes("Légende") || skill.name.includes("Ultime")) return "legendary";
    if (skill.name.includes("Ascension") || skill.cost >= 50) return "rare";
    if (skill.cost >= 20) return "uncommon";
    return "common";
  };

  return (
    <div className="poke-skill-modal">
      {/* Header Bar */}
      <div className="poke-header-bar">
        <div className="poke-header-left">
          <div className={`poke-pokemon-frame ${helper.isShiny ? 'shiny' : ''}`}>
            <img 
              src={getAnimatedSprite(currentEvolution.pokemonId, helper.isShiny)} 
              alt={currentEvolution.name}
              onError={(e) => { 
                (e.target as HTMLImageElement).src = getStaticSprite(currentEvolution.pokemonId, helper.isShiny); 
              }}
            />
          </div>
          <div className="poke-pokemon-info">
            <span className="poke-pokemon-name">
              {currentEvolution.name}
              {helper.isShiny && <span className="poke-shiny-badge">✦</span>}
            </span>
            <span className="poke-pokemon-level">Lv. {helper.level}</span>
          </div>
        </div>
        <div className="poke-header-center">
          <span className="poke-title">ARBRE DE TALENTS</span>
        </div>
        <div className="poke-header-right">
          <div className="poke-ev-display">
            <div className="poke-ev-icon">EV</div>
            <div className="poke-ev-info">
              <span className="poke-ev-value">{evRemaining}</span>
              <span className="poke-ev-label">disponibles</span>
            </div>
          </div>
          <button className="poke-close-btn" onClick={onClose}>✕</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="poke-content">
        {/* Tree Viewport */}
        <div 
          className="poke-tree-viewport" 
          ref={viewportRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid Background */}
          <div className="poke-grid-bg" />
          
          {/* Tree World */}
          <div 
            className="poke-tree-world"
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
          >
            {/* Connections */}
            <svg className="poke-connections" width="1" height="1" style={{ overflow: 'visible' }}>
              {skillTree.skills.map(skill => {
                if (!skill.prerequisites || !skill.position) return null;
                
                const targetX = skill.position.x * GRID_SIZE_X;
                const targetY = skill.position.y * GRID_SIZE_Y;

                return skill.prerequisites.map(prereqId => {
                  const parent = skillTree.skills.find(s => s.id === prereqId);
                  if (!parent || !parent.position) return null;

                  const startX = parent.position.x * GRID_SIZE_X;
                  const startY = parent.position.y * GRID_SIZE_Y;
                  const controlY = (startY + targetY) / 2;
                  const d = `M ${startX} ${startY} C ${startX} ${controlY}, ${targetX} ${controlY}, ${targetX} ${targetY}`;

                  const isUnlocked = helper.unlockedSkills.includes(skill.id) && helper.unlockedSkills.includes(parent.id);
                  const isAvailable = helper.unlockedSkills.includes(parent.id);

                  return (
                    <path 
                      key={`${parent.id}-${skill.id}`}
                      d={d}
                      className={`poke-path ${isUnlocked ? 'unlocked' : isAvailable ? 'available' : 'locked'}`}
                    />
                  );
                });
              })}
            </svg>

            {/* Skill Nodes */}
            {skillTree.skills.map(skill => {
              if (!skill.position) return null;
              
              const isUnlocked = helper.unlockedSkills.includes(skill.id);
              const check = canUnlockSkill(skill, helper);
              const isAvailable = !isUnlocked && check.canUnlock;
              const isLocked = !isUnlocked && !check.canUnlock;
              const isSelected = selectedSkillId === skill.id;
              const rarity = getSkillRarity(skill);

              return (
                <button
                  key={skill.id}
                  className={`poke-skill-node ${rarity} ${isUnlocked ? 'unlocked' : ''} ${isAvailable ? 'available' : ''} ${isLocked ? 'locked' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{
                    left: skill.position.x * GRID_SIZE_X,
                    top: skill.position.y * GRID_SIZE_Y,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSkillId(skill.id);
                  }}
                >
                  <span className="poke-node-icon">{getSkillIcon(skill)}</span>
                  <span className="poke-node-cost">{skill.cost}</span>
                </button>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="poke-instructions">
            <span>🖱️ Glisser pour naviguer</span>
            <span>👆 Cliquer pour sélectionner</span>
          </div>
        </div>

        {/* Detail Sidebar */}
        <div className="poke-sidebar">
          {selectedSkill ? (
            <div className="poke-skill-detail">
              {/* Skill Header */}
              <div className={`poke-skill-header ${getSkillRarity(selectedSkill)}`}>
                <div className="poke-skill-icon-large">
                  {getSkillIcon(selectedSkill)}
                </div>
                <div className="poke-skill-title">
                  <span className="poke-skill-name">{selectedSkill.name}</span>
                  <span className={`poke-skill-status ${helper.unlockedSkills.includes(selectedSkill.id) ? 'active' : 'inactive'}`}>
                    {helper.unlockedSkills.includes(selectedSkill.id) ? '● ACTIF' : '○ INACTIF'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="poke-skill-desc">
                <p>{selectedSkill.description}</p>
              </div>

              {/* Effect */}
              <div className="poke-skill-effect">
                <div className="poke-effect-label">EFFET</div>
                <div className="poke-effect-value">
                  {selectedSkill.type === 'PRODUCTION_MULTIPLIER' 
                    ? `Production ×${selectedSkill.value.toFixed(1)}` 
                    : `Production +${formatNum(selectedSkill.value)}/s`}
                </div>
              </div>

              {/* Stats */}
              <div className="poke-skill-stats">
                <div className="poke-stat-row">
                  <span className="poke-stat-label">Coût</span>
                  <span className={`poke-stat-value ${evRemaining < selectedSkill.cost && !helper.unlockedSkills.includes(selectedSkill.id) ? 'insufficient' : ''}`}>
                    {selectedSkill.cost} EV
                  </span>
                </div>
                <div className="poke-stat-row">
                  <span className="poke-stat-label">Type</span>
                  <span className="poke-stat-value type">
                    {selectedSkill.type === 'PRODUCTION_MULTIPLIER' ? 'Multiplicateur' : 'Bonus'}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="poke-skill-action">
                {helper.unlockedSkills.includes(selectedSkill.id) ? (
                  <div className="poke-already-unlocked">
                    <span className="poke-check">✓</span>
                    <span>Talent débloqué</span>
                  </div>
                ) : (
                  <>
                    <button 
                      className="poke-unlock-btn"
                      disabled={!canUnlockSkill(selectedSkill, helper).canUnlock}
                      onClick={() => handleUnlock(selectedSkill.id)}
                    >
                      <span className="poke-btn-icon">◆</span>
                      <span>{t('clicker.skillTree.unlockButton')}</span>
                    </button>
                    {!canUnlockSkill(selectedSkill, helper).canUnlock && (
                      <div className="poke-unlock-reason">
                        {canUnlockSkill(selectedSkill, helper).reason || "Prérequis manquants"}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="poke-no-selection">
              <div className="poke-no-selection-icon">◇</div>
              <p>Sélectionnez un talent</p>
              <span>Cliquez sur un nœud de l'arbre pour voir les détails</span>
            </div>
          )}

          {/* Legend */}
          <div className="poke-legend">
            <div className="poke-legend-title">LÉGENDE</div>
            <div className="poke-legend-items">
              <div className="poke-legend-item">
                <span className="poke-legend-dot common" />
                <span>Commun</span>
              </div>
              <div className="poke-legend-item">
                <span className="poke-legend-dot uncommon" />
                <span>Peu commun</span>
              </div>
              <div className="poke-legend-item">
                <span className="poke-legend-dot rare" />
                <span>Rare</span>
              </div>
              <div className="poke-legend-item">
                <span className="poke-legend-dot legendary" />
                <span>Légendaire</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
