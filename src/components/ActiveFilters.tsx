import type { FilterOptions } from '../types/pokemon'
import { GENERATIONS, POKEMON_TYPES } from '../types/pokemon'
import { TYPE_ICONS, REGIONAL_FORM_ICONS, CATEGORY_ICONS } from '../config/constants'
import '../styles/ActiveFilters.css'

interface ActiveFiltersProps {
  filters: FilterOptions
  targetTotal: number
}

export const ActiveFilters = ({ filters, targetTotal }: ActiveFiltersProps) => {
  const hasFilters = 
    (filters.generations && filters.generations.length > 0) ||
    (filters.types && filters.types.length > 0) ||
    filters.legendary ||
    filters.mythical ||
    filters.mega ||
    filters.gigantamax ||
    filters.ultraBeast ||
    filters.legendsZA ||
    filters.paradox ||
    (filters.regionalForms && filters.regionalForms.length > 0)

  if (!hasFilters) {
    return (
      <div className="active-filters">
        <h3 className="filters-title">🎯 Filtres actifs</h3>
        <p className="no-filters">Aucun filtre appliqué</p>
        <p className="all-pokemon">Tous les Pokémon (Gen 1-9)</p>
      </div>
    )
  }

  return (
    <div className="active-filters">
      <h3 className="filters-title">🎯 Filtres actifs</h3>
      
      <div className="filter-header-row">
        <div className="filter-mode-compact">
          {filters.filterMode === 'OR' ? (
            <span className="mode-badge-compact mode-or">➕ Additif</span>
          ) : (
            <span className="mode-badge-compact mode-and">🔒 Restrictif</span>
          )}
        </div>
        <div className="target-score">
          <span className="target-label">Objectif:</span>
          <span className="target-value">{targetTotal}</span>
        </div>
      </div>

      {filters.generations && filters.generations.length > 0 && (
        <div className="filter-group">
          <div className="filter-group-title">🎮 Générations</div>
          <div className="filter-tags">
            {filters.generations.map(gen => (
              <span key={gen} className="filter-tag">
                Gen {gen}
              </span>
            ))}
          </div>
        </div>
      )}

      {filters.types && filters.types.length > 0 && (
        <div className="filter-group">
          <div className="filter-group-title">⚡ Types</div>
          <div className="filter-tags">
            {filters.types.map(type => (
              <span key={type} className="filter-tag type-tag">
                {TYPE_ICONS[type]} {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {(filters.legendary || filters.mythical || filters.ultraBeast || filters.paradox) && (
        <div className="filter-group">
          <div className="filter-group-title">✨ Rareté</div>
          <div className="filter-tags">
            {filters.legendary && <span className="filter-tag">{CATEGORY_ICONS.LEGENDARY} Légendaires</span>}
            {filters.mythical && <span className="filter-tag">{CATEGORY_ICONS.MYTHICAL} Mythiques</span>}
            {filters.ultraBeast && <span className="filter-tag">{CATEGORY_ICONS.ULTRA_BEAST} Ultra-Chimères</span>}
            {filters.paradox && <span className="filter-tag">{CATEGORY_ICONS.PARADOX} Paradox</span>}
          </div>
        </div>
      )}

      {(filters.mega || filters.gigantamax || filters.legendsZA) && (
        <div className="filter-group">
          <div className="filter-group-title">💎 Formes Spéciales</div>
          <div className="filter-tags">
            {filters.mega && <span className="filter-tag">{CATEGORY_ICONS.MEGA} Méga-évolutions</span>}
            {filters.gigantamax && <span className="filter-tag">{CATEGORY_ICONS.GIGANTAMAX} Gigantamax</span>}
            {filters.legendsZA && <span className="filter-tag">{CATEGORY_ICONS.LEGENDS_ZA} Légendes Z-A</span>}
          </div>
        </div>
      )}

      {filters.regionalForms && filters.regionalForms.length > 0 && (
        <div className="filter-group">
          <div className="filter-group-title">🌍 Formes Régionales</div>
          <div className="filter-tags">
            {filters.regionalForms.map(form => (
              <span key={form} className="filter-tag">
                {REGIONAL_FORM_ICONS[form]} {form.charAt(0).toUpperCase() + form.slice(1)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}