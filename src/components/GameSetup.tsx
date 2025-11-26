
import { useState, useEffect } from 'react'
import type { FilterOptions } from '../types/pokemon'
import { GENERATIONS, POKEMON_TYPES } from '../types/pokemon'
import {
  GAME_CONFIG,
  STORAGE_KEYS,
  TYPE_ICONS,
  REGIONAL_FORM_ICONS,
  CATEGORY_ICONS
} from '../config/constants'

interface GameSetupProps {
  onStart: (targetTotal: number, filters: FilterOptions, skipConfirmation: boolean) => void
}

export const GameSetup = ({ onStart }: GameSetupProps) => {
  const [targetTotal, setTargetTotal] = useState<number>(GAME_CONFIG.DEFAULT_TARGET_TOTAL)
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [legendaryOnly, setLegendaryOnly] = useState(false)
  const [mythicalOnly, setMythicalOnly] = useState(false)
  const [ultraBeastOnly, setUltraBeastOnly] = useState(false)
  const [paradoxOnly, setParadoxOnly] = useState(false)
  const [megaOnly, setMegaOnly] = useState(false)
  const [gigantamaxOnly, setGigantamaxOnly] = useState(false)
  const [legendsZAOnly, setLegendsZAOnly] = useState(false)
  const [selectedRegionalForms, setSelectedRegionalForms] = useState<('alola' | 'galar' | 'hisui' | 'paldea')[]>([])
  const [filterMode, setFilterMode] = useState<'AND' | 'OR'>('OR')
  const [skipConfirmation, setSkipConfirmation] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SKIP_CONFIRMATION)
    return saved === 'true'
  })

  // Save preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SKIP_CONFIRMATION, skipConfirmation.toString())
  }, [skipConfirmation])

  const toggleGeneration = (gen: number) => {
    setSelectedGenerations(prev =>
      prev.includes(gen) ? prev.filter(g => g !== gen) : [...prev, gen]
    )
  }

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const toggleRegionalForm = (form: 'alola' | 'galar' | 'hisui' | 'paldea') => {
    setSelectedRegionalForms(prev =>
      prev.includes(form) ? prev.filter(f => f !== form) : [...prev, form]
    )
  }

  const handleStart = () => {
    const filters: FilterOptions = {
      filterMode
    }
    
    if (selectedGenerations.length > 0) {
      filters.generations = selectedGenerations
    }
    
    if (selectedTypes.length > 0) {
      filters.types = selectedTypes
    }

    if (legendaryOnly) {
      filters.legendary = true
    }

    if (mythicalOnly) {
      filters.mythical = true
    }

    if (ultraBeastOnly) {
      filters.ultraBeast = true
    }

    if (paradoxOnly) {
      filters.paradox = true
    }

    if (megaOnly) {
      filters.mega = true
    }

    if (gigantamaxOnly) {
      filters.gigantamax = true
    }

    if (legendsZAOnly) {
      filters.legendsZA = true
    }

    if (selectedRegionalForms.length > 0) {
      filters.regionalForms = selectedRegionalForms
    }

    onStart(targetTotal, filters, skipConfirmation)
  }

  const hasSpecialFilters = legendaryOnly || mythicalOnly || ultraBeastOnly || paradoxOnly || megaOnly || gigantamaxOnly || legendsZAOnly || selectedRegionalForms.length > 0

  return (
    <div className="game-setup">
      <h1>PokéStats Challenge</h1>
      <p className="game-description">
        Devinez quelle statistique est la plus élevée parmi 6 Pokémon tirés au hasard.
        Les valeurs sont cachées jusqu'à confirmation !
      </p>

      <div className="setup-section">
        <h3>🎯 Configuration</h3>
        
        <div className="config-row">
          <div className="config-item">
            <label>
              <span className="label-text">Total de stats à atteindre :</span>
              <input
                type="number"
                value={targetTotal}
                onChange={(e) => setTargetTotal(Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                min={GAME_CONFIG.MIN_TARGET_TOTAL}
                max={GAME_CONFIG.MAX_TARGET_TOTAL}
                step={GAME_CONFIG.TARGET_STEP}
                className="stat-input"
              />
            </label>
            <p className="hint">Recommandé : {GAME_CONFIG.DEFAULT_TARGET_TOTAL}</p>
          </div>

          <div className="config-item">
            <span className="label-text">Mode de filtrage :</span>
            <div className="mode-buttons-compact">
              <button
                type="button"
                className={`mode-button-compact ${filterMode === 'AND' ? 'active' : ''}`}
                onClick={() => setFilterMode('AND')}
              >
                <span className="mode-icon">🔒</span>
                <span className="mode-name">Restrictif</span>
              </button>
              <button
                type="button"
                className={`mode-button-compact ${filterMode === 'OR' ? 'active' : ''}`}
                onClick={() => setFilterMode('OR')}
              >
                <span className="mode-icon">➕</span>
                <span className="mode-name">Additif</span>
              </button>
            </div>
            <p className="hint mode-hint">
              {filterMode === 'AND' ? '🔒 Combinaison' : '➕ Addition'}
            </p>
          </div>
        </div>
      </div>

      <div className="setup-section">
        <h3>🎲 Filtres de Sélection</h3>
        
        <div className="filters-container-new">
          {/* Section 1: Générations */}
          <div className="filter-section full-width">
            <h4 className="section-title">🎮 Générations</h4>
            <p className="section-description">Sélectionnez une ou plusieurs générations</p>
            
            <div className="checkbox-grid generations-grid">
              {Object.entries(GENERATIONS).map(([key, gen]) => (
                <label key={key} className="checkbox-label-new">
                  <input
                    type="checkbox"
                    checked={selectedGenerations.includes(Number(key))}
                    onChange={() => toggleGeneration(Number(key))}
                    className="checkbox-input-new"
                  />
                  <span className="checkbox-text">
                    {gen.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: Types */}
          <div className="filter-section full-width">
            <h4 className="section-title">⚡ Types</h4>
            <p className="section-description">Sélectionnez un ou plusieurs types</p>
            
            <div className="checkbox-grid types-grid">
              {POKEMON_TYPES.map((type) => (
                <label key={type} className="checkbox-label-new">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleType(type)}
                    className="checkbox-input-new"
                  />
                  <span className="checkbox-text">
                    <span className="checkbox-icon">{TYPE_ICONS[type]}</span>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 4: Rareté */}
          <div className="filter-section">
            <h4 className="section-title">✨ Rareté</h4>
            <p className="section-description">Pokémon spéciaux et rares</p>
            
            <div className="checkbox-grid">
              <label className="checkbox-label-new">
                <input
                  type="checkbox"
                  checked={legendaryOnly}
                  onChange={(e) => setLegendaryOnly(e.target.checked)}
                  className="checkbox-input-new"
                />
                <span className="checkbox-text">
                  <span className="checkbox-icon">{CATEGORY_ICONS.LEGENDARY}</span>
                  Légendaires
                </span>
              </label>

              <label className="checkbox-label-new">
                <input
                  type="checkbox"
                  checked={mythicalOnly}
                  onChange={(e) => setMythicalOnly(e.target.checked)}
                  className="checkbox-input-new"
                />
                <span className="checkbox-text">
                  <span className="checkbox-icon">{CATEGORY_ICONS.MYTHICAL}</span>
                  Mythiques
                </span>
              </label>

              <label className="checkbox-label-new">
                <input
                  type="checkbox"
                  checked={ultraBeastOnly}
                  onChange={(e) => setUltraBeastOnly(e.target.checked)}
                  className="checkbox-input-new"
                />
                <span className="checkbox-text">
                  <span className="checkbox-icon">{CATEGORY_ICONS.ULTRA_BEAST}</span>
                  Ultra-Chimères
                </span>
              </label>

              <label className="checkbox-label-new">
                <input
                  type="checkbox"
                  checked={paradoxOnly}
                  onChange={(e) => setParadoxOnly(e.target.checked)}
                  className="checkbox-input-new"
                />
                <span className="checkbox-text">
                  <span className="checkbox-icon">{CATEGORY_ICONS.PARADOX}</span>
                  Paradox
                </span>
              </label>
            </div>
          </div>

          {/* Section 5: Formes Spéciales */}
          <div className="filter-section">
            <h4 className="section-title">🔮 Formes Spéciales</h4>
            <p className="section-description">Méga-évolutions et transformations</p>
            
            <div className="checkbox-grid">
              <label className="checkbox-label-new">
                <input
                  type="checkbox"
                  checked={megaOnly}
                  onChange={(e) => setMegaOnly(e.target.checked)}
                  className="checkbox-input-new"
                />
                <span className="checkbox-text">
                  <span className="checkbox-icon">{CATEGORY_ICONS.MEGA}</span>
                  Méga-évolutions
                </span>
              </label>

              <label className="checkbox-label-new">
                <input
                  type="checkbox"
                  checked={gigantamaxOnly}
                  onChange={(e) => setGigantamaxOnly(e.target.checked)}
                  className="checkbox-input-new"
                />
                <span className="checkbox-text">
                  <span className="checkbox-icon">{CATEGORY_ICONS.GIGANTAMAX}</span>
                  Gigantamax
                </span>
              </label>

              <label className="checkbox-label-new">
                <input
                  type="checkbox"
                  checked={legendsZAOnly}
                  onChange={(e) => setLegendsZAOnly(e.target.checked)}
                  className="checkbox-input-new"
                />
                <span className="checkbox-text">
                  <span className="checkbox-icon">{CATEGORY_ICONS.LEGENDS_ZA}</span>
                  Légendes Z-A
                </span>
              </label>
            </div>
          </div>

          {/* Section 6: Formes Régionales */}
          <div className="filter-section full-width">
            <h4 className="section-title">🌍 Formes Régionales</h4>
            <p className="section-description">Sélectionnez une ou plusieurs formes régionales</p>
            
            <div className="checkbox-grid">
              <label className="checkbox-label-new">
                <input
                  type="checkbox"
                  checked={selectedRegionalForms.includes('alola')}
                  onChange={() => toggleRegionalForm('alola')}
                  className="checkbox-input-new"
                />
                <span className="checkbox-text">
                  <span className="checkbox-icon">{REGIONAL_FORM_ICONS.alola}</span>
                  Formes d'Alola
                </span>
              </label>

              <label className="checkbox-label-new">
                <input
                  type="checkbox"
                  checked={selectedRegionalForms.includes('galar')}
                  onChange={() => toggleRegionalForm('galar')}
                  className="checkbox-input-new"
                />
                <span className="checkbox-text">
                  <span className="checkbox-icon">{REGIONAL_FORM_ICONS.galar}</span>
                  Formes de Galar
                </span>
              </label>

              <label className="checkbox-label-new">
                <input
                  type="checkbox"
                  checked={selectedRegionalForms.includes('hisui')}
                  onChange={() => toggleRegionalForm('hisui')}
                  className="checkbox-input-new"
                />
                <span className="checkbox-text">
                  <span className="checkbox-icon">{REGIONAL_FORM_ICONS.hisui}</span>
                  Formes de Hisui
                </span>
              </label>

              <label className="checkbox-label-new">
                <input
                  type="checkbox"
                  checked={selectedRegionalForms.includes('paldea')}
                  onChange={() => toggleRegionalForm('paldea')}
                  className="checkbox-input-new"
                />
                <span className="checkbox-text">
                  <span className="checkbox-icon">{REGIONAL_FORM_ICONS.paldea}</span>
                  Formes de Paldea
                </span>
              </label>
            </div>
          </div>
        </div>

        {hasSpecialFilters && (
          <div className="filter-warning">
            <span className="warning-icon">⚠️</span>
            <span>Les filtres spéciaux réduisent le nombre de Pokémon disponibles</span>
          </div>
        )}
      </div>

      <button onClick={handleStart} className="start-button">
        🎮 Commencer le jeu
      </button>
    </div>
  )
}