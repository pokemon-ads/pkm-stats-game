import i18n from '../i18n';
import type { FilterOptions } from '../types/pokemon';

export interface LeaderboardEntry {
  score: number;
  rounds: number;
  date: string;
}

export interface Leaderboard {
  filterKey: string;
  filterDescription: string;
  entries: LeaderboardEntry[];
}

const STORAGE_PREFIX = 'pkm_stats_leaderboard_';

export class LeaderboardService {
  private static generateKey(filters: FilterOptions): string {
    // Create a deterministic key based on filters
    // We need to handle arrays and sort them to ensure same key for same set of filters
    const keyParts: string[] = [];

    if (filters.generations && filters.generations.length > 0) {
      keyParts.push(`gen:${[...filters.generations].sort().join(',')}`);
    } else if (filters.generation) {
       keyParts.push(`gen:${filters.generation}`);
    }

    if (filters.types && filters.types.length > 0) {
      keyParts.push(`type:${[...filters.types].sort().join(',')}`);
    } else if (filters.type) {
      keyParts.push(`type:${filters.type}`);
    }

    if (filters.legendary) keyParts.push('legendary');
    if (filters.mythical) keyParts.push('mythical');
    if (filters.mega) keyParts.push('mega');
    if (filters.gigantamax) keyParts.push('gmax');
    if (filters.ultraBeast) keyParts.push('ub');
    if (filters.legendsZA) keyParts.push('za');
    if (filters.paradox) keyParts.push('paradox');
    
    if (filters.regionalForms && filters.regionalForms.length > 0) {
      keyParts.push(`regional:${[...filters.regionalForms].sort().join(',')}`);
    } else if (filters.regionalForm) {
      keyParts.push(`regional:${filters.regionalForm}`);
    }

    if (filters.filterMode) keyParts.push(`mode:${filters.filterMode}`);

    return keyParts.join('|') || 'default';
  }

  private static generateDescription(filters: FilterOptions): string {
    const parts: string[] = [];

    if (filters.generations && filters.generations.length > 0) {
      parts.push(`${i18n.t('tooltip.generations')} ${filters.generations.join(', ')}`);
    } else if (filters.generation) {
      parts.push(`${i18n.t('gameProgress.gen', { generations: filters.generation })}`);
    }

    if (filters.types && filters.types.length > 0) {
      parts.push(`${i18n.t('tooltip.types')} ${filters.types.join(', ')}`);
    } else if (filters.type) {
      parts.push(`${i18n.t('tooltip.types')} ${filters.type}`);
    }

    const specials = [];
    if (filters.legendary) specials.push(i18n.t('tooltip.legendary'));
    if (filters.mythical) specials.push(i18n.t('tooltip.mythical'));
    if (filters.mega) specials.push(i18n.t('tooltip.mega'));
    if (filters.gigantamax) specials.push(i18n.t('tooltip.gigantamax'));
    if (filters.ultraBeast) specials.push(i18n.t('tooltip.ultraBeast'));
    if (filters.legendsZA) specials.push(i18n.t('tooltip.legendsZA'));
    if (filters.paradox) specials.push(i18n.t('tooltip.paradox'));
    
    if (filters.regionalForms && filters.regionalForms.length > 0) {
      specials.push(i18n.t('tooltip.forms', { forms: filters.regionalForms.join(', ') }));
    } else if (filters.regionalForm) {
      specials.push(i18n.t('tooltip.forms', { forms: filters.regionalForm }));
    }

    if (specials.length > 0) {
      parts.push(specials.join(', '));
    }

    if (parts.length === 0) return i18n.t('gameProgress.allGen');
    return parts.join(' | ');
  }

  static getLeaderboard(filters: FilterOptions): Leaderboard {
    const key = this.generateKey(filters);
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse leaderboard', e);
      }
    }

    return {
      filterKey: key,
      filterDescription: this.generateDescription(filters),
      entries: []
    };
  }

  static saveScore(filters: FilterOptions, score: number, rounds: number): Leaderboard {
    const leaderboard = this.getLeaderboard(filters);
    
    const newEntry: LeaderboardEntry = {
      score,
      rounds,
      date: new Date().toISOString()
    };

    leaderboard.entries.push(newEntry);
    
    // Sort by score (descending)
    leaderboard.entries.sort((a, b) => b.score - a.score);
    
    // Keep top 50
    if (leaderboard.entries.length > 50) {
      leaderboard.entries = leaderboard.entries.slice(0, 50);
    }

    localStorage.setItem(STORAGE_PREFIX + leaderboard.filterKey, JSON.stringify(leaderboard));
    
    return leaderboard;
  }

  static clearLeaderboard(filters: FilterOptions): void {
    const key = this.generateKey(filters);
    localStorage.removeItem(STORAGE_PREFIX + key);
  }
}