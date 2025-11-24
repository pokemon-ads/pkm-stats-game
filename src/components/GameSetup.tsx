import { useState } from 'react'
import type { FilterOptions } from '../types/pokemon'
import { REGIONS, GENERATIONS, POKEMON_TYPES } from '../types/pokemon'

interface GameSetupProps {
  onStart: (targetTotal: number, filters: FilterOptions) => void
}

export const GameSetup = ({ onStart }: GameSetupProps) => {
  const [targetTotal, setTargetTotal] = useState(600)
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [selectedGeneration, setSelectedGeneration] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [legendaryOnly, setLegendaryOnly] = useState(false)
  const [mythicalOnly, setMythicalOnly] = useState(false)
  const [ultraBeastOnly, setUltraBeastOnly] = useState(false)
  const [megaOnly, setMegaOnly] = useState(false)
  const [gigantamaxOnly, setGigantamaxOnly] = useState(false)
  const [legendsZAOnly, setLegendsZAOnly] = useState(false)
  const [selectedRegionalForm, setSelectedRegionalForm] = useState<string>('')

  const handleStart = () => {
    const filters: FilterOptions = {}
    
    // Priority: Generation > Region
    if (selectedGeneration) {
      filters.generation = Number(selectedGeneration)
    } else if (selectedRegion) {
      filters.region = selectedRegion
    }
    
    if (selectedType) {
      filters.type = selectedType
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

    if (megaOnly) {
      filters.mega = true
    }

    if (gigantamaxOnly) {
      filters.gigantamax = true
    }

    if (legendsZAOnly) {
      filters.legendsZA = true
    }

    if (selectedRegionalForm) {
      filters.regionalForm = selectedRegionalForm as 'alola' | 'galar' | 'hisui' | 'paldea'
    }

    onStart(targetTotal, filters)
  }

  const hasSpecialFilters = legendaryOnly || mythicalOnly || ultraBeastOnly || megaOnly || gigantamaxOnly || legendsZAOnly || selectedRegionalForm

  return (
    <div className="game-setup">
      <h1>PokéStats Challenge</h1>
      <p className="game-description">
        Devinez quelle statistique est la plus élevée parmi 6 Pokémon tirés au hasard.
        Les valeurs sont cachées jusqu'à confirmation !
      </p>

      <div className="setup-section">
        <label>
          <span className="label-text">Total de stats à atteindre :</span>
          <input
            type="number"
            value={targetTotal}
            onChange={(e) => setTargetTotal(Number(e.target.value))}
            onFocus={(e) => e.target.select()}
            min={100}
            max={1000}
            step={50}
            className="stat-input"
          />
        </label>
        <p className="hint">Recommandé : 600 (moyenne d'un Pokémon légendaire)</p>
      </div>

      <div className="setup-section">
        <h3>🎯 Filtres de Sélection</h3>
        
        <div className="filters-container-new">
          {/* Section 1: Portée */}
          <div className="filter-section">
            <h4 className="section-title">📍 Portée</h4>
            <p className="section-description">Choisissez une génération OU une région</p>
            
            <div className="filter-row">
              <label className="filter-label">
                <span className="label-icon">🎮</span>
                <span className="label-text">Génération</span>
                <select
                  value={selectedGeneration}
                  onChange={(e) => {
                    setSelectedGeneration(e.target.value)
                    if (e.target.value) setSelectedRegion('')
                  }}
                  className="filter-select-new"
                >
                  <option value="">Toutes (Gen 1-9)</option>
                  {Object.entries(GENERATIONS).map(([key, gen]) => (
                    <option key={key} value={key}>
                      {gen.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="filter-label">
                <span className="label-icon">🗺️</span>
                <span className="label-text">Région</span>
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value)
                    if (e.target.value) setSelectedGeneration('')
                  }}
                  className="filter-select-new"
                  disabled={!!selectedGeneration}
                >
                  <option value="">Toutes</option>
                  {Object.entries(REGIONS).map(([key, region]) => (
                    <option key={key} value={key}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Section 2: Type */}
          <div className="filter-section">
            <h4 className="section-title">⚡ Type</h4>
            <p className="section-description">Filtrer par type élémentaire</p>
            
            <div className="filter-row">
              <label className="filter-label full-width">
                <span className="label-icon">🔥</span>
                <span className="label-text">Type de Pokémon</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="filter-select-new"
                >
                  <option value="">Tous les types</option>
                  {POKEMON_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Section 3: Rareté */}
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
                  <span className="checkbox-icon">👑</span>
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
                  <span className="checkbox-icon">🌟</span>
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
                  <span className="checkbox-icon">👾</span>
                  Ultra-Chimères
                </span>
              </label>
            </div>
          </div>

          {/* Section 4: Formes Spéciales */}
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
                  <span className="checkbox-icon">💎</span>
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
                  <span className="checkbox-icon">⭐</span>
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
                  <span className="checkbox-icon">🅰️</span>
                  Légendes Z-A
                </span>
              </label>
            </div>
          </div>

          {/* Section 5: Formes Régionales */}
          <div className="filter-section">
            <h4 className="section-title">🌍 Formes Régionales</h4>
            <p className="section-description">Variantes régionales des Pokémon</p>
            
            <div className="filter-row">
              <label className="filter-label full-width">
                <span className="label-icon">🏝️</span>
                <span className="label-text">Forme régionale</span>
                <select
                  value={selectedRegionalForm}
                  onChange={(e) => setSelectedRegionalForm(e.target.value)}
                  className="filter-select-new"
                >
                  <option value="">Aucune (forme standard)</option>
                  <option value="alola">🏝️ Formes d'Alola (18 Pokémon)</option>
                  <option value="galar">🏰 Formes de Galar (19 Pokémon)</option>
                  <option value="hisui">⛰️ Formes de Hisui (17 Pokémon)</option>
                  <option value="paldea">🌮 Formes de Paldea (Tauros)</option>
                </select>
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