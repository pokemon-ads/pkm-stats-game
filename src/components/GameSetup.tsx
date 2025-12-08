
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
    <div className="game-setup-dashboard">
      <div className="dashboard-header">
        <h1>{t('setup.title')}</h1>
        <div className="quick-config">
          <div className="config-group">
            <label>{t('setup.target')}</label>
            <input
              type="number"
              value={targetTotal}
              onChange={(e) => setTargetTotal(Number(e.target.value))}
              min={GAME_CONFIG.MIN_TARGET_TOTAL}
              max={GAME_CONFIG.MAX_TARGET_TOTAL}
              step={GAME_CONFIG.TARGET_STEP}
              className="compact-input"
            />
          </div>
          <div className="config-group">
            <label>{t('setup.mode')}</label>
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
              {CATEGORY_ICONS.LEGENDARY} {t('setup.legendary')}
            </button>
            <button
              className={`extra-chip ${mythicalOnly ? 'active' : ''}`}
              onClick={() => setMythicalOnly(!mythicalOnly)}
            >
              {CATEGORY_ICONS.MYTHICAL} {t('setup.mythical')}
            </button>
            <button
              className={`extra-chip ${ultraBeastOnly ? 'active' : ''}`}
              onClick={() => setUltraBeastOnly(!ultraBeastOnly)}
            >
              {CATEGORY_ICONS.ULTRA_BEAST} {t('setup.ultraBeast')}
            </button>
            <button
              className={`extra-chip ${paradoxOnly ? 'active' : ''}`}
              onClick={() => setParadoxOnly(!paradoxOnly)}
            >
              {CATEGORY_ICONS.PARADOX} {t('setup.paradox')}
            </button>
            <button
              className={`extra-chip ${megaOnly ? 'active' : ''}`}
              onClick={() => setMegaOnly(!megaOnly)}
            >
              {CATEGORY_ICONS.MEGA} {t('setup.mega')}
            </button>
            <button
              className={`extra-chip ${gigantamaxOnly ? 'active' : ''}`}
              onClick={() => setGigantamaxOnly(!gigantamaxOnly)}
            >
              {CATEGORY_ICONS.GIGANTAMAX} {t('setup.gigantamax')}
            </button>
            <button
              className={`extra-chip ${legendsZAOnly ? 'active' : ''}`}
              onClick={() => setLegendsZAOnly(!legendsZAOnly)}
            >
              {CATEGORY_ICONS.LEGENDS_ZA} {t('setup.legendsZA')}
            </button>
          </div>

          <h3 className="sub-header">{t('setup.regional')}</h3>
          <div className="extras-grid">
            <button
              className={`extra-chip ${selectedRegionalForms.includes('alola') ? 'active' : ''}`}
              onClick={() => toggleRegionalForm('alola')}
            >
              {REGIONAL_FORM_ICONS.alola} {t('setup.alola')}
            </button>
            <button
              className={`extra-chip ${selectedRegionalForms.includes('galar') ? 'active' : ''}`}
              onClick={() => toggleRegionalForm('galar')}
            >
              {REGIONAL_FORM_ICONS.galar} {t('setup.galar')}
            </button>
            <button
              className={`extra-chip ${selectedRegionalForms.includes('hisui') ? 'active' : ''}`}
              onClick={() => toggleRegionalForm('hisui')}
            >
              {REGIONAL_FORM_ICONS.hisui} {t('setup.hisui')}
            </button>
            <button
              className={`extra-chip ${selectedRegionalForms.includes('paldea') ? 'active' : ''}`}
              onClick={() => toggleRegionalForm('paldea')}
            >
              {REGIONAL_FORM_ICONS.paldea} {t('setup.paldea')}
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