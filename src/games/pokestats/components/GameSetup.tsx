
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { FilterOptions } from '../types/game'
import { GENERATIONS, POKEMON_TYPES } from '../../../types/pokemon'
import {
  GAME_CONFIG,
  STORAGE_KEYS,
  REGIONAL_FORM_ICONS,
  CATEGORY_ICONS
} from '../config/constants'
import { pokemonService } from '../../../services/pokemon.service'

interface GameSetupProps {
  onStart: (targetTotal: number, filters: FilterOptions, skipConfirmation: boolean) => void
}

export const GameSetup = ({ onStart }: GameSetupProps) => {
  const { t } = useTranslation()
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
  const [filterMode, setFilterMode] = useState<'AND' | 'OR'>('AND')
  const [skipConfirmation, setSkipConfirmation] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SKIP_CONFIRMATION)
    return saved === 'true'
  })
  
  // Load sprite URLs from API (same as in the game)
  const [spriteCache, setSpriteCache] = useState<Record<string, string>>({})
  
  useEffect(() => {
    const loadSprites = async () => {
      const sprites: Record<string, string> = {}
      
      // Load category icons
      for (const [key, formName] of Object.entries(CATEGORY_ICONS)) {
        try {
          const pokemon = await pokemonService.getPokemon(formName)
          sprites[`category_${key}`] = pokemon.sprites.front_default
        } catch (error) {
          console.warn(`Failed to load sprite for ${formName}:`, error)
        }
      }
      
      // Load regional form icons
      for (const [key, formName] of Object.entries(REGIONAL_FORM_ICONS)) {
        try {
          const pokemon = await pokemonService.getPokemon(formName)
          sprites[`regional_${key}`] = pokemon.sprites.front_default
        } catch (error) {
          console.warn(`Failed to load sprite for ${formName}:`, error)
        }
      }
      
      setSpriteCache(sprites)
    }
    
    loadSprites()
  }, [])

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

  return (
    <div className="game-setup-dashboard">
      <div className="dashboard-header">
        <h1>{t('setup.title')}</h1>
        <div className="quick-config">
          <label>{t('setup.target')}</label>
          <div className="score-selector">
            <button
              className="score-adjust-btn decrease"
              onClick={() => setTargetTotal(prev => Math.max(GAME_CONFIG.MIN_TARGET_TOTAL, prev - 50))}
              title="-50"
              type="button"
            >
              <span className="arrow">◀</span>
              <span className="value">-50</span>
            </button>
            <input
              type="number"
              value={targetTotal}
              onChange={(e) => setTargetTotal(Number(e.target.value))}
              min={GAME_CONFIG.MIN_TARGET_TOTAL}
              max={GAME_CONFIG.MAX_TARGET_TOTAL}
              step={GAME_CONFIG.TARGET_STEP}
              className="compact-input score-input"
            />
            <button
              className="score-adjust-btn increase"
              onClick={() => setTargetTotal(prev => Math.min(GAME_CONFIG.MAX_TARGET_TOTAL, prev + 50))}
              title="+50"
              type="button"
            >
              <span className="value">+50</span>
              <span className="arrow">▶</span>
            </button>
          </div>
          <div className="label-with-help">
            <label>{t('setup.mode')}</label>
            <div className="help-tooltip-container">
              <span className="help-icon">?</span>
              <div className="help-tooltip">
                <h4>{t('setup.modeHelp')}</h4>
                <p><strong>{t('setup.addition')}</strong>: {t('setup.modeHelpAdditive')}</p>
                <p><strong>{t('setup.restriction')}</strong>: {t('setup.modeHelpRestrictive')}</p>
              </div>
            </div>
          </div>
          <div className="toggle-switch-mode">
            <button
              className={`mode-toggle ${filterMode === 'OR' ? 'active' : ''}`}
              onClick={() => setFilterMode('OR')}
              title={t('setup.addition')}
            >
              ➕
            </button>
            <button
              className={`mode-toggle ${filterMode === 'AND' ? 'active' : ''}`}
              onClick={() => setFilterMode('AND')}
              title={t('setup.restriction')}
            >
              🔒
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Column 1: Generations & Types */}
        <div className="dashboard-panel main-filters-panel">
          <div className="panel-section">
            <h3>{t('setup.generations')}</h3>
            <div className="generations-grid-compact">
              {Object.entries(GENERATIONS).map(([key, gen]) => (
                <button
                  key={key}
                  className={`gen-chip ${selectedGenerations.includes(Number(key)) ? 'active' : ''}`}
                  onClick={() => toggleGeneration(Number(key))}
                  title={gen.name}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <h3>{t('setup.types')}</h3>
            <div className="types-grid-compact">
              {POKEMON_TYPES.map((type) => (
                <button
                  key={type}
                  className={`type-chip ${selectedTypes.includes(type) ? `active type-${type}` : ''}`}
                  onClick={() => toggleType(type)}
                  title={t(`types.${type}`)}
                >
                  {t(`types.${type}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Extras */}
        <div className="dashboard-panel extras-panel">
          <h3>{t('setup.special')}</h3>
          <div className="extras-grid">
            <button
              className={`extra-chip ${legendaryOnly ? 'active' : ''}`}
              onClick={() => setLegendaryOnly(!legendaryOnly)}
            >
              {spriteCache[`category_LEGENDARY`] ? (
                <img src={spriteCache[`category_LEGENDARY`]} alt={t('setup.legendary')} className="category-icon-sprite" onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = '<span>👑</span>';
                }} />
              ) : (
                <span>👑</span>
              )} {t('setup.legendary')}
            </button>
            <button
              className={`extra-chip ${mythicalOnly ? 'active' : ''}`}
              onClick={() => setMythicalOnly(!mythicalOnly)}
            >
              {spriteCache[`category_MYTHICAL`] ? (
                <img src={spriteCache[`category_MYTHICAL`]} alt={t('setup.mythical')} className="category-icon-sprite" onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = '<span>🌟</span>';
                }} />
              ) : (
                <span>🌟</span>
              )} {t('setup.mythical')}
            </button>
            <button
              className={`extra-chip ${ultraBeastOnly ? 'active' : ''}`}
              onClick={() => setUltraBeastOnly(!ultraBeastOnly)}
            >
              {spriteCache[`category_ULTRA_BEAST`] ? (
                <img src={spriteCache[`category_ULTRA_BEAST`]} alt={t('setup.ultraBeast')} className="category-icon-sprite" onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = '<span>👾</span>';
                }} />
              ) : (
                <span>👾</span>
              )} {t('setup.ultraBeast')}
            </button>
            <button
              className={`extra-chip ${paradoxOnly ? 'active' : ''}`}
              onClick={() => setParadoxOnly(!paradoxOnly)}
            >
              {spriteCache[`category_PARADOX`] ? (
                <img src={spriteCache[`category_PARADOX`]} alt={t('setup.paradox')} className="category-icon-sprite" onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = '<span>⏳</span>';
                }} />
              ) : (
                <span>⏳</span>
              )} {t('setup.paradox')}
            </button>
            <button
              className={`extra-chip ${megaOnly ? 'active' : ''}`}
              onClick={() => setMegaOnly(!megaOnly)}
            >
              {spriteCache[`category_MEGA`] ? (
                <img src={spriteCache[`category_MEGA`]} alt={t('setup.mega')} className="category-icon-sprite" onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = '<span>💎</span>';
                }} />
              ) : (
                <span>💎</span>
              )} {t('setup.mega')}
            </button>
            <button
              className={`extra-chip ${gigantamaxOnly ? 'active' : ''}`}
              onClick={() => setGigantamaxOnly(!gigantamaxOnly)}
            >
              {spriteCache[`category_GIGANTAMAX`] ? (
                <img src={spriteCache[`category_GIGANTAMAX`]} alt={t('setup.gigantamax')} className="category-icon-sprite" onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = '<span>⭐</span>';
                }} />
              ) : (
                <span>⭐</span>
              )} {t('setup.gigantamax')}
            </button>
            <button
              className={`extra-chip ${legendsZAOnly ? 'active' : ''}`}
              onClick={() => setLegendsZAOnly(!legendsZAOnly)}
            >
              {spriteCache[`category_LEGENDS_ZA`] ? (
                <img src={spriteCache[`category_LEGENDS_ZA`]} alt={t('setup.legendsZA')} className="category-icon-sprite" onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = '<span>🅰️</span>';
                }} />
              ) : (
                <span>🅰️</span>
              )} {t('setup.legendsZA')}
            </button>
          </div>

          <h3 className="sub-header">{t('setup.regional')}</h3>
          <div className="extras-grid">
            <button
              className={`extra-chip ${selectedRegionalForms.includes('alola') ? 'active' : ''}`}
              onClick={() => toggleRegionalForm('alola')}
            >
              {spriteCache[`regional_alola`] ? (
                <img src={spriteCache[`regional_alola`]} alt={t('setup.alola')} className="category-icon-sprite" onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = '<span>🏝️</span>';
                }} />
              ) : (
                <span>🏝️</span>
              )} {t('setup.alola')}
            </button>
            <button
              className={`extra-chip ${selectedRegionalForms.includes('galar') ? 'active' : ''}`}
              onClick={() => toggleRegionalForm('galar')}
            >
              {spriteCache[`regional_galar`] ? (
                <img src={spriteCache[`regional_galar`]} alt={t('setup.galar')} className="category-icon-sprite" onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = '<span>🏰</span>';
                }} />
              ) : (
                <span>🏰</span>
              )} {t('setup.galar')}
            </button>
            <button
              className={`extra-chip ${selectedRegionalForms.includes('hisui') ? 'active' : ''}`}
              onClick={() => toggleRegionalForm('hisui')}
            >
              {spriteCache[`regional_hisui`] ? (
                <img src={spriteCache[`regional_hisui`]} alt={t('setup.hisui')} className="category-icon-sprite" onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = '<span>⛰️</span>';
                }} />
              ) : (
                <span>⛰️</span>
              )} {t('setup.hisui')}
            </button>
            <button
              className={`extra-chip ${selectedRegionalForms.includes('paldea') ? 'active' : ''}`}
              onClick={() => toggleRegionalForm('paldea')}
            >
              {spriteCache[`regional_paldea`] ? (
                <img src={spriteCache[`regional_paldea`]} alt={t('setup.paldea')} className="category-icon-sprite" onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.outerHTML = '<span>🌮</span>';
                }} />
              ) : (
                <span>🌮</span>
              )} {t('setup.paldea')}
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleStart} className="start-button-dashboard">
        {t('setup.play')}
      </button>
    </div>
  )
}