import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClickerContext } from '../context/ClickerContext';
import { getSkillTree, getSkill, createSkillTrees, canUnlockSkill } from '../config/skill-trees';
import type { PokemonHelper, Skill } from '../types/game';
import '../styles/SkillTree.css';

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

interface SkillTreeProps {
  helper: PokemonHelper;
  onClose: () => void;
}

export const SkillTree: React.FC<SkillTreeProps> = ({ helper, onClose }) => {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(ClickerContext);

  // Get skill tree for this helper
  const skillTree = useMemo(() => {
    const allHelperIds = state.helpers.map(h => h.id);
    const skillTrees = createSkillTrees(allHelperIds);
    return getSkillTree(helper.id, skillTrees);
  }, [helper.id, state.helpers]);

  if (!skillTree) {
    return (
      <div className="skill-tree-modal">
      <div className="skill-tree-content">
        <div className="skill-tree-header">
          <h2>{t('clicker.skillTree.title')} - {helper.name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <p>{t('clicker.skillTree.noSkillTree')}</p>
      </div>
      </div>
    );
  }

  const handleUnlockSkill = (skillId: string) => {
    dispatch({ type: 'UNLOCK_SKILL', payload: { helperId: helper.id, skillId } });
  };

  // Find skills unlocked by this skill
  const getUnlockedSkills = (skillId: string): Skill[] => {
    return skillTree.skills.filter(skill => 
      skill.prerequisites?.includes(skillId)
    );
  };

  // Organize skills by tier/row
  const skillsByRow = useMemo(() => {
    const rows: { [y: number]: Skill[] } = {};
    skillTree.skills.forEach(skill => {
      const y = skill.position?.y || 0;
      if (!rows[y]) rows[y] = [];
      rows[y].push(skill);
    });
    return rows;
  }, [skillTree]);

  const maxRow = Math.max(...Object.keys(skillsByRow).map(Number));

  return (
    <div className="skill-tree-modal" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="skill-tree-content">
        <div className="skill-tree-header">
          <div className="header-left">
            <h2>{helper.name}</h2>
            <div className="header-subtitle">{t('clicker.skillTree.title')}</div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="skill-tree-info">
          <div className="info-card">
            <div className="info-item">
              <span className="info-label">{t('clicker.pokemonList.level')}</span>
              <span className="info-value">{helper.level}/252</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('clicker.pokemonList.evPoints')}</span>
              <span className="info-value highlight">{formatNumber(helper.ev)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('clicker.pokemonList.skillsCount')}</span>
              <span className="info-value">{helper.unlockedSkills.length}/{skillTree.skills.length}</span>
            </div>
          </div>
        </div>

        <div className="skill-tree-wrapper">
          <div className="skill-tree-canvas">
            {/* SVG for connections */}
            <svg className="skill-connections" viewBox="0 0 1200 1000" preserveAspectRatio="xMidYMid meet">
              {skillTree.skills.map((skill) => {
                if (!skill.prerequisites || skill.prerequisites.length === 0 || !skill.position) return null;
                
                return skill.prerequisites.map((prereqId) => {
                  const prereqSkill = skillTree.skills.find(s => s.id === prereqId);
                  if (!prereqSkill || !prereqSkill.position) return null;
                  
                  const isPrereqUnlocked = helper.unlockedSkills.includes(prereqId);
                  const isSkillUnlocked = helper.unlockedSkills.includes(skill.id);
                  const connectionClass = isPrereqUnlocked && isSkillUnlocked ? 'unlocked' : 
                                         isPrereqUnlocked ? 'available' : 'locked';
                  
                  // Calculate positions (scaled to viewBox)
                  // Adjusted for better visual spacing
                  const fromX = (prereqSkill.position.x * 350 + 160) * 10;
                  const fromY = (prereqSkill.position.y * 180 + 160) * 10;
                  const toX = (skill.position.x * 350 + 160) * 10;
                  const toY = (skill.position.y * 180 + 160) * 10;
                  
                  return (
                    <line
                      key={`${prereqId}-${skill.id}`}
                      x1={fromX}
                      y1={fromY}
                      x2={toX}
                      y2={toY}
                      className={`connection-line ${connectionClass}`}
                      strokeWidth="40"
                    />
                  );
                });
              })}
            </svg>

            {/* Skill nodes organized by rows */}
            {Object.entries(skillsByRow).map(([row, skills]) => {
              const rowNum = parseInt(row);
              return (
                <div key={row} className="skill-row" style={{ gridRow: rowNum + 1 }}>
                  {skills.map((skill, skillIndex) => {
                    const isUnlocked = helper.unlockedSkills.includes(skill.id);
                    const unlockCheck = canUnlockSkill(skill, helper);
                    const canUnlock = unlockCheck.canUnlock;
                    const unlockedByThis = getUnlockedSkills(skill.id);

                    return (
                      <div
                        key={skill.id}
                        className={`skill-node ${isUnlocked ? 'unlocked' : canUnlock ? 'available' : 'locked'}`}
                      >
                        <div className="skill-node-inner">
                          <div className="skill-header">
                            <div className="skill-icon-wrapper">
                              <div className="skill-icon">
                                {skill.icon || (isUnlocked ? '★' : '☆')}
                              </div>
                              {isUnlocked && <div className="skill-checkmark">✓</div>}
                            </div>
                            <div className="skill-title-section">
                              <div className="skill-name">{skill.name}</div>
                              {isUnlocked && <div className="skill-status-badge unlocked-badge">✓</div>}
                            </div>
                          </div>

                          <div className="skill-description">{skill.description}</div>

                          <div className="skill-effect">
                            {skill.type === 'PRODUCTION_BONUS' && (
                              <div className="effect-display">
                                <span className="effect-label">{t('clicker.skillTree.bonus')}</span>
                                <span className="effect-value">+{formatNumber(skill.value)}</span>
                              </div>
                            )}
                            {skill.type === 'PRODUCTION_MULTIPLIER' && (
                              <div className="effect-display">
                                <span className="effect-label">{t('clicker.skillTree.multiplier')}</span>
                                <span className="effect-value">×{skill.value.toFixed(1)}</span>
                              </div>
                            )}
                            {skill.type === 'SPECIAL' && (
                              <div className="effect-display">
                                <span className="effect-label">{t('clicker.skillTree.specialEffect')}</span>
                                <span className="effect-value">×{skill.value.toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          {!isUnlocked && (
                            <div className="skill-cost-section">
                              <div className="cost-display">
                                <span className="cost-label">{t('clicker.skillTree.cost')}</span>
                                <span className={`cost-value ${helper.ev < skill.cost ? 'insufficient' : ''}`}>
                                  {formatNumber(skill.cost)} EV
                                </span>
                              </div>
                              {helper.ev < skill.cost && (
                                <div className="cost-warning">
                                  {t('clicker.skillTree.missingEV', { amount: formatNumber(skill.cost - helper.ev) })}
                                </div>
                              )}
                            </div>
                          )}

                          {skill.prerequisites && skill.prerequisites.length > 0 && (
                            <div className="skill-prereqs">
                              <div className="prereqs-label">{t('clicker.skillTree.prerequisites')}</div>
                              <div className="prereqs-list">
                                {skill.prerequisites.map(prereqId => {
                                  const prereq = skillTree.skills.find(s => s.id === prereqId);
                                  const isPrereqUnlocked = helper.unlockedSkills.includes(prereqId);
                                  return prereq ? (
                                    <div key={prereqId} className={`prereq-badge ${isPrereqUnlocked ? 'unlocked' : 'missing'}`}>
                                      {isPrereqUnlocked ? '✓' : '○'} {prereq.name}
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}

                          {unlockedByThis.length > 0 && (
                            <div className="skill-unlocks">
                              <div className="unlocks-label">{t('clicker.skillTree.unlocks')}</div>
                              <div className="unlocks-list">
                                {unlockedByThis.map(unlockedSkill => (
                                  <div key={unlockedSkill.id} className="unlock-badge">
                                    {unlockedSkill.name} ({formatNumber(unlockedSkill.cost)} EV)
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {!isUnlocked && canUnlock && (
                            <button
                              className="skill-unlock-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlockSkill(skill.id);
                              }}
                            >
                              {t('clicker.skillTree.unlockButton')}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
