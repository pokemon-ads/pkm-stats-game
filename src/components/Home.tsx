import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { GameState } from '../games/clicker/types/game'
import '../styles/Home.css'

// Game configuration with distinct colors and Pokemon mascots
const GAMES_CONFIG = {
  pokestats: {
    id: 'pokestats',
    path: '/pokestats',
    title: 'PokéStats',
    mascotId: 448, // Lucario - known for balanced stats
    backgroundPokemon: [150, 384, 445, 376, 248], // Mewtwo, Rayquaza, Garchomp, Metagross, Tyranitar
    primaryColor: '#EF4444', // Red
    secondaryColor: '#DC2626',
    accentColor: '#FCA5A5',
    gradientStart: '#EF4444',
    gradientEnd: '#B91C1C',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    badgeKey: 'popular',
    badgeColor: '#EF4444',
    stats: { players: '2.5K+', games: '50K+' }
  },
  pokequizz: {
    id: 'pokequizz',
    path: '/pokequizz',
    title: 'PokéQuizz',
    mascotId: 94, // Gengar - mysterious and quiz-like
    backgroundPokemon: [201, 132, 352, 292, 94], // Unown, Ditto, Kecleon, Shedinja, Gengar
    primaryColor: '#8B5CF6', // Purple
    secondaryColor: '#7C3AED',
    accentColor: '#C4B5FD',
    gradientStart: '#8B5CF6',
    gradientEnd: '#6D28D9',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    badgeKey: 'classic',
    badgeColor: '#8B5CF6',
    stats: { players: '3.2K+', games: '120K+' }
  },
  pokeclicker: {
    id: 'pokeclicker',
    path: '/clicker',
    title: 'PokéClicker',
    mascotId: 25, // Pikachu - iconic and energetic
    backgroundPokemon: [6, 9, 3, 149, 143], // Charizard, Blastoise, Venusaur, Dragonite, Snorlax
    primaryColor: '#F59E0B', // Amber/Gold
    secondaryColor: '#D97706',
    accentColor: '#FCD34D',
    gradientStart: '#F59E0B',
    gradientEnd: '#B45309',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    badgeKey: 'new',
    badgeColor: '#10B981',
    stats: { players: '1.8K+', games: '∞' }
  }
}

const SAVE_KEY = 'pokeclicker_save'

// Featured Pokemon for hero section animation
const HERO_POKEMON = [25, 6, 150, 384, 94, 448, 149, 131, 143, 133]

const formatNumber = (num: number): string => {
  if (num >= 1e18) return (num / 1e18).toFixed(1) + 'Qi'
  if (num >= 1e15) return (num / 1e15).toFixed(1) + 'Qa'
  if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return Math.floor(num).toLocaleString()
}

const getClickerGameState = (): GameState | null => {
  try {
    const savedState = localStorage.getItem(SAVE_KEY)
    if (savedState) {
      return JSON.parse(savedState) as GameState
    }
  } catch (error) {
    console.error('Failed to load clicker game state:', error)
  }
  return null
}

export const Home = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [clickerGameState, setClickerGameState] = useState<GameState | null>(null)
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [heroIndex, setHeroIndex] = useState(0)
  const [bgPokemonIndices, setBgPokemonIndices] = useState<Record<string, number>>({
    pokestats: 0,
    pokequizz: 0,
    pokeclicker: 0,
  })

  // Initialize visibility
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Hero Pokemon rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % HERO_POKEMON.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Background Pokemon rotation for cards
  useEffect(() => {
    const interval = setInterval(() => {
      setBgPokemonIndices(prev => ({
        pokestats: (prev.pokestats + 1) % GAMES_CONFIG.pokestats.backgroundPokemon.length,
        pokequizz: (prev.pokequizz + 1) % GAMES_CONFIG.pokequizz.backgroundPokemon.length,
        pokeclicker: (prev.pokeclicker + 1) % GAMES_CONFIG.pokeclicker.backgroundPokemon.length,
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Load clicker game state
  useEffect(() => {
    const gameState = getClickerGameState()
    setClickerGameState(gameState)
    
    const updateInterval = setInterval(() => {
      const updatedState = getClickerGameState()
      setClickerGameState(updatedState)
    }, 2000)
    
    return () => clearInterval(updateInterval)
  }, [])

  const handleGameClick = useCallback((path: string) => {
    navigate(path)
  }, [navigate])

  const games = Object.values(GAMES_CONFIG)

  return (
    <div className={`game-portal ${isVisible ? 'visible' : ''}`}>
      {/* Animated Background */}
      <div className="portal-background">
        <div className="bg-gradient"></div>
        <div className="bg-pattern"></div>
        <div className="floating-pokemon">
          {HERO_POKEMON.slice(0, 6).map((id, index) => (
            <img
              key={id}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
              alt=""
              className={`floating-sprite floating-sprite-${index + 1}`}
              style={{ animationDelay: `${index * -2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="portal-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="title-line">{t('home.hero.welcomeTo')}</span>
              <span className="title-brand">{t('home.hero.brand')}</span>
            </h1>
            <p className="hero-subtitle">
              {t('home.hero.subtitle')}
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                  alt=""
                  className="stat-icon"
                />
                <div className="stat-info">
                  <span className="stat-value">3</span>
                  <span className="stat-label">{t('home.hero.games')}</span>
                </div>
              </div>
              <div className="hero-stat">
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pokedex.png"
                  alt=""
                  className="stat-icon"
                />
                <div className="stat-info">
                  <span className="stat-value">1025</span>
                  <span className="stat-label">{t('home.hero.pokemon')}</span>
                </div>
              </div>
              <div className="hero-stat">
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png"
                  alt=""
                  className="stat-icon"
                />
                <div className="stat-info">
                  <span className="stat-value">100%</span>
                  <span className="stat-label">{t('home.hero.free')}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-mascot">
            <div className="mascot-glow"></div>
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${HERO_POKEMON[heroIndex]}.png`}
              alt="Featured Pokemon"
              className="mascot-image"
            />
          </div>
        </section>

        {/* Games Library Section */}
        <section className="games-library">
          <div className="library-header">
            <h2 className="library-title">
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/vs-recorder.png"
                alt=""
                className="title-icon"
              />
              {t('home.library.title')}
            </h2>
            <p className="library-subtitle">{t('home.library.subtitle')}</p>
          </div>

          <div className="games-grid">
            {games.map((game) => (
              <article
                key={game.id}
                className={`game-card ${activeGame === game.id ? 'active' : ''}`}
                onClick={() => handleGameClick(game.path)}
                onMouseEnter={() => setActiveGame(game.id)}
                onMouseLeave={() => setActiveGame(null)}
                style={{
                  '--primary': game.primaryColor,
                  '--secondary': game.secondaryColor,
                  '--accent': game.accentColor,
                  '--glow': game.glowColor,
                  '--gradient-start': game.gradientStart,
                  '--gradient-end': game.gradientEnd,
                } as React.CSSProperties}
              >
                {/* Card Background */}
                <div className="card-background">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${game.backgroundPokemon[bgPokemonIndices[game.id]]}.png`}
                    alt=""
                    className="card-bg-pokemon"
                  />
                  <div className="card-bg-overlay"></div>
                  <div className="card-bg-gradient"></div>
                </div>

                {/* Badge */}
                <div
                  className="card-badge"
                  style={{ backgroundColor: game.badgeColor }}
                >
                  {t(`home.${game.badgeKey}`).toUpperCase()}
                </div>

                {/* Mascot */}
                <div className="card-mascot">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${game.mascotId}.png`}
                    alt={game.title}
                    className="mascot-sprite"
                  />
                </div>

                {/* Content */}
                <div className="card-content">
                  <div className="card-header">
                    <h3 className="card-title">{game.title}</h3>
                    <span className="card-subtitle">{t(`home.games.${game.id}.subtitle`)}</span>
                  </div>

                  <p className="card-description">{t(`home.games.${game.id}.description`)}</p>

                  {/* Features */}
                  <div className="card-features">
                    {game.id === 'pokestats' && (
                      <>
                        <span className="feature-tag">{t('home.games.pokestats.features.compareStats')}</span>
                        <span className="feature-tag">{t('home.games.pokestats.features.leaderboard')}</span>
                        <span className="feature-tag">{t('home.games.pokestats.features.allGenerations')}</span>
                      </>
                    )}
                    {game.id === 'pokequizz' && (
                      <>
                        <span className="feature-tag">{t('home.games.pokequizz.features.silhouetteMode')}</span>
                        <span className="feature-tag">{t('home.games.pokequizz.features.speedChallenge')}</span>
                        <span className="feature-tag">{t('home.games.pokequizz.features.hintsSystem')}</span>
                      </>
                    )}
                    {game.id === 'pokeclicker' && (
                      <>
                        <span className="feature-tag">{t('home.games.pokeclicker.features.idleProgress')}</span>
                        <span className="feature-tag">{t('home.games.pokeclicker.features.upgrades')}</span>
                        <span className="feature-tag">{t('home.games.pokeclicker.features.pokemonCollection')}</span>
                      </>
                    )}
                  </div>

                  {/* Clicker Progress */}
                  {game.id === 'pokeclicker' && clickerGameState && (
                    <div className="card-progress">
                      <div className="progress-item">
                        <img
                          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thunder-stone.png"
                          alt=""
                          className="progress-icon"
                        />
                        <span className="progress-value">{formatNumber(clickerGameState.energy)}</span>
                        <span className="progress-label">{t('home.progress.energy')}</span>
                      </div>
                      <div className="progress-item">
                        <img
                          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png"
                          alt=""
                          className="progress-icon"
                        />
                        <span className="progress-value">{formatNumber(clickerGameState.energyPerSecond)}/s</span>
                        <span className="progress-label">{t('home.progress.perSecond')}</span>
                      </div>
                    </div>
                  )}

                  {/* Play Button */}
                  <button className="card-play-button">
                    <span className="play-text">
                      {game.id === 'pokeclicker' && clickerGameState ? t('home.continue') : t('home.playNow')}
                    </span>
                    <span className="play-arrow">→</span>
                  </button>
                </div>

                {/* Decorative Elements */}
                <div className="card-decorations">
                  <div className="deco-circle deco-circle-1"></div>
                  <div className="deco-circle deco-circle-2"></div>
                  <div className="deco-line deco-line-1"></div>
                  <div className="deco-line deco-line-2"></div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}