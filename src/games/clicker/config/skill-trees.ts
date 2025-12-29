import type { Skill, SkillTree } from '../types/game';

// Helper function to create a skill with position
const createSkill = (
  id: string,
  name: string,
  description: string,
  cost: number,
  type: Skill['type'],
  value: number,
  prerequisites?: string[],
  position?: { x: number; y: number }
): Skill => ({
  id,
  name,
  description,
  cost,
  type,
  value,
  prerequisites,
  position: position || { x: 0, y: 0 },
});

// Base skill tree template that can be customized per helper
// Toutes les compétences concernent uniquement ce helper spécifique
const createBaseSkillTree = (helperId: string): Skill[] => {
  const skills: Skill[] = [];

  // Tier 1: Compétences de base (niveau 1-50) - Total: 12 EV
  skills.push(createSkill(
    `${helperId}_base_1`,
    'Fondations Solides',
    'Augmente la production de base de 25%',
    2,
    'PRODUCTION_MULTIPLIER',
    1.25,
    undefined,
    { x: 0, y: 0 }
  ));

  skills.push(createSkill(
    `${helperId}_base_2`,
    'Entraînement Intensif',
    'Augmente la production de base de 50%',
    4,
    'PRODUCTION_MULTIPLIER',
    1.5,
    [`${helperId}_base_1`],
    { x: 1, y: 0 }
  ));

  skills.push(createSkill(
    `${helperId}_base_3`,
    'Discipline de Fer',
    'Augmente la production de base de 75%',
    6,
    'PRODUCTION_MULTIPLIER',
    1.75,
    [`${helperId}_base_2`],
    { x: 2, y: 0 }
  ));

  // Tier 2: Bonus de production (niveau 51-100) - Total: 34 EV
  skills.push(createSkill(
    `${helperId}_bonus_1`,
    'Récolte Abondante I',
    '+100 production de base',
    7,
    'PRODUCTION_BONUS',
    100,
    [`${helperId}_base_1`],
    { x: 0, y: 1 }
  ));

  skills.push(createSkill(
    `${helperId}_bonus_2`,
    'Récolte Abondante II',
    '+250 production de base',
    11,
    'PRODUCTION_BONUS',
    250,
    [`${helperId}_bonus_1`],
    { x: 0, y: 2 }
  ));

  skills.push(createSkill(
    `${helperId}_bonus_3`,
    'Flux Énergétique',
    '+500 production de base',
    16,
    'PRODUCTION_BONUS',
    500,
    [`${helperId}_bonus_2`],
    { x: 0, y: 3 }
  ));

  // Tier 2: Multiplicateurs (niveau 51-100) - Total: 43 EV
  skills.push(createSkill(
    `${helperId}_mult_1`,
    'Synergie Élémentaire',
    'Double la production actuelle',
    9,
    'PRODUCTION_MULTIPLIER',
    2.0,
    [`${helperId}_base_2`],
    { x: 1, y: 1 }
  ));

  skills.push(createSkill(
    `${helperId}_mult_2`,
    'Harmonie Naturelle',
    'Multiplie la production par 2.5',
    14,
    'PRODUCTION_MULTIPLIER',
    2.5,
    [`${helperId}_mult_1`],
    { x: 1, y: 2 }
  ));

  skills.push(createSkill(
    `${helperId}_mult_3`,
    'Résonance Spirituelle',
    'Triple la production',
    20,
    'PRODUCTION_MULTIPLIER',
    3.0,
    [`${helperId}_mult_2`],
    { x: 1, y: 3 }
  ));

  // Tier 3: Compétences spéciales (niveau 101-150) - Total: 51 EV
  skills.push(createSkill(
    `${helperId}_special_1`,
    'Puissance Cachée',
    'Multiplie la production par 3.5',
    22,
    'PRODUCTION_MULTIPLIER',
    3.5,
    [`${helperId}_base_3`],
    { x: 2, y: 1 }
  ));

  skills.push(createSkill(
    `${helperId}_special_2`,
    'Force Intérieure',
    'Quadruple la production',
    29,
    'PRODUCTION_MULTIPLIER',
    4.0,
    [`${helperId}_special_1`],
    { x: 2, y: 2 }
  ));

  // Tier 4: Compétences ultimes (niveau 151-252) - Total: 112 EV
  skills.push(createSkill(
    `${helperId}_ultimate_1`,
    'Éveil Ancestral',
    'Multiplie la production par 5.0',
    32,
    'PRODUCTION_MULTIPLIER',
    5.0,
    [`${helperId}_mult_3`, `${helperId}_special_2`],
    { x: 1, y: 4 }
  ));

  skills.push(createSkill(
    `${helperId}_ultimate_2`,
    'Transcendance',
    'Multiplie la production par 6.0',
    38,
    'PRODUCTION_MULTIPLIER',
    6.0,
    [`${helperId}_ultimate_1`],
    { x: 1, y: 5 }
  ));

  skills.push(createSkill(
    `${helperId}_ultimate_3`,
    'Ascension Divine',
    'Multiplie la production par 7.5',
    42,
    'PRODUCTION_MULTIPLIER',
    7.5,
    [`${helperId}_ultimate_2`],
    { x: 1, y: 6 }
  ));
  
  // Total: 2+4+6+7+11+16+9+14+20+22+29+32+38+42 = 252 EV

  return skills;
};

// Create skill trees for all helpers
export const createSkillTrees = (helperIds: string[]): SkillTree[] => {
  return helperIds.map(helperId => ({
    helperId,
    skills: createBaseSkillTree(helperId),
  }));
};

// Get skill tree for a specific helper
export const getSkillTree = (helperId: string, allSkillTrees: SkillTree[]): SkillTree | undefined => {
  return allSkillTrees.find(tree => tree.helperId === helperId);
};

// Get skill by ID
export const getSkill = (skillId: string, skillTree: SkillTree): Skill | undefined => {
  return skillTree.skills.find(skill => skill.id === skillId);
};

// Check if a skill can be unlocked
export const canUnlockSkill = (
  skill: Skill,
  helper: { ev: number; unlockedSkills: string[] }
): { canUnlock: boolean; reason?: string } => {
  // Check if already unlocked
  if (helper.unlockedSkills.includes(skill.id)) {
    return { canUnlock: false, reason: 'Déjà débloquée' };
  }

  // Check if enough EV points
  if (helper.ev < skill.cost) {
    return { canUnlock: false, reason: 'Pas assez de points EV' };
  }

  // Check prerequisites
  if (skill.prerequisites && skill.prerequisites.length > 0) {
    const missingPrereqs = skill.prerequisites.filter(
      prereq => !helper.unlockedSkills.includes(prereq)
    );
    if (missingPrereqs.length > 0) {
      return { canUnlock: false, reason: 'Prérequis manquants' };
    }
  }

  return { canUnlock: true };
};

