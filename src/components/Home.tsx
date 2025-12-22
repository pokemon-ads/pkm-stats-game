import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { GameState } from '../games/clicker/types/game'
import '../styles/Home.css'

// Animated Pokemon sprites for the hero section
const HERO_POKEMON = [25, 1, 4, 7, 150, 151, 133, 143, 94, 130];

const SAVE_KEY = 'pokeclicker_save'

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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentPokemon, setCurrentPokemon] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [clickerGameState, setClickerGameState] = useState<GameState | null>(null)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentPokemon(prev => (prev + 1) % HERO_POKEMON.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Load clicker game state
    const gameState = getClickerGameState()
    setClickerGameState(gameState)
    
    // Update periodically to show latest stats
    const updateInterval = setInterval(() => {
      const updatedState = getClickerGameState()
      setClickerGameState(updatedState)
    }, 2000)
    
    return () => clearInterval(updateInterval)
  }, [])

  const games = [
    {
      id: 'pokestats',
      path: '/pokestats',
      icon: '📊',
      badge: t('home.popular'),
      badgeType: 'popular',
      title: t('nav.pokestats'),
      description: t('home.pokestatsDesc'),
      features: [
        { icon: '📊', label: t('home.featureStats') },
        { icon: '🏆', label: t('home.featureLeaderboard') }
      ],
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
      glowColor: 'rgba(255, 107, 107, 0.3)'
    },
    {
      id: 'pokequizz',
      path: '/pokequizz',
      icon: '❓',
      badge: t('home.popular'),
      badgeType: 'popular',
      title: t('nav.pokequizz'),
      description: t('home.pokequizzDesc'),
      features: [
        { icon: '🧠', label: t('home.featureKnowledge') },
        { icon: '⚡', label: t('home.featureSpeed') }
      ],
      gradient: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
      glowColor: 'rgba(155, 89, 182, 0.3)'
    },
    {
      id: 'pokeclicker',
      path: '/clicker',
      icon: '⚡',
      badge: t('home.new'),
      badgeType: 'new',
      title: t('nav.pokeclicker'),
      description: t('home.pokeclickerDesc'),
      features: [
        { icon: '🎮', label: t('home.featureIdle') },
        { icon: '✨', label: t('home.featureEvolution') }
      ],
      gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
      glowColor: 'rgba(168, 85, 247, 0.3)'
    }
  ]

  return (
    <div className={`home-container ${isVisible ? 'visible' : ''}`}>
      {/* Animated Background */}
      <div className="home-background">
        <div className="bg-gradient-1"></div>
        <div className="bg-gradient-2"></div>
        <div className="bg-gradient-3"></div>
        <div className="floating-pokeballs">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`floating-pokeball pokeball-${i + 1}`}></div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-pokemon-showcase">
            <div className="pokemon-ring">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${HERO_POKEMON[currentPokemon]}.gif`}
                alt="Pokemon"
                className="hero-pokemon-sprite"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${HERO_POKEMON[currentPokemon]}.png`
                }}
              />
            </div>
            <div className="pokemon-dots">
              {HERO_POKEMON.map((_, i) => (
                <span 
                  key={i} 
                  className={`dot ${i === currentPokemon ? 'active' : ''}`}
                  onClick={() => setCurrentPokemon(i)}
                ></span>
              ))}
            </div>
          </div>
          
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="title-line">
                <span className="wave-emoji">👋</span>
                <span className="title-word">{t('home.welcome')}</span>
              </span>
            </h1>
            <p className="hero-subtitle">{t('home.subtitle')}</p>
            <p className="hero-description">
              Discover three exciting Pokemon games: test your knowledge of Pokemon statistics, identify Pokemon from silhouettes and clues, or enjoy an addictive idle clicker experience. All games are completely free to play, no registration required!
            </p>
            <div className="hero-cta">
              <button className="cta-button primary" onClick={() => navigate('/pokestats')}>
                <span className="cta-icon">🎮</span>
                <span>{t('home.letsPlay')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="games-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">🎯</span>
            {t('home.gamesTitle')}
          </h2>
          <div className="section-line"></div>
        </div>
        
        <div className="games-grid">
          {games.map((game, index) => (
            <article 
              key={game.id}
              className={`game-card game-card-${game.id}`}
              onClick={() => navigate(game.path)}
              style={{ 
                '--card-gradient': game.gradient,
                '--card-glow': game.glowColor,
                '--animation-delay': `${index * 0.1}s`
              } as React.CSSProperties}
            >
              <div className="card-background">
                <div className="card-glow"></div>
                <div className="card-pattern"></div>
              </div>
              
              <div className="card-content">
                <header className="card-header">
                  <div className="card-icon-wrapper" style={{ background: game.gradient }}>
                    <span className="card-icon">{game.icon}</span>
                  </div>
                  <span className={`card-badge ${game.badgeType}`}>{game.badge}</span>
                </header>
                
                <div className="card-body">
                  <h3 className="card-title">{game.title}</h3>
                  <p className="card-description">{game.description}</p>
                  
                  {/* Game progress preview for PokeClicker */}
                  {game.id === 'pokeclicker' && clickerGameState && (
                    <div className="game-progress-preview">
                      <div className="progress-stats">
                        <div className="progress-stat">
                          <span className="progress-icon">⚡</span>
                          <div className="progress-info">
                            <span className="progress-label">Énergie</span>
                            <span className="progress-value">{formatNumber(clickerGameState.energy)}</span>
                          </div>
                        </div>
                        <div className="progress-stat">
                          <span className="progress-icon">📊</span>
                          <div className="progress-info">
                            <span className="progress-label">Total</span>
                            <span className="progress-value">{formatNumber(clickerGameState.totalEnergy)}</span>
                          </div>
                        </div>
                        <div className="progress-stat">
                          <span className="progress-icon">👥</span>
                          <div className="progress-info">
                            <span className="progress-label">Pokémon</span>
                            <span className="progress-value">
                              {clickerGameState.helpers.reduce((sum, h) => sum + h.count, 0)}
                            </span>
                          </div>
                        </div>
                        <div className="progress-stat">
                          <span className="progress-icon">⚡</span>
                          <div className="progress-info">
                            <span className="progress-label">/s</span>
                            <span className="progress-value">{formatNumber(clickerGameState.energyPerSecond)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <footer className="card-footer">
                  <div className="card-features">
                    {game.features.map((feature, i) => (
                      <span key={i} className="feature-tag">
                        <span className="feature-icon">{feature.icon}</span>
                        <span className="feature-label">{feature.label}</span>
                      </span>
                    ))}
                  </div>
                  
                  <button className="card-button" style={{ background: game.gradient }}>
                    <span>{clickerGameState && game.id === 'pokeclicker' ? t('home.continue') : t('home.letsPlay')}</span>
                    <span className="button-arrow">→</span>
                  </button>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">📖</span>
            {t('home.about.title')}
          </h2>
          <div className="section-line"></div>
        </div>
        
        <div className="about-content">
          <p className="about-intro">{t('home.about.intro')}</p>
          
          <div className="about-text">
            <p>
              PKM Stats is a free, educational gaming platform dedicated to Pokemon fans worldwide. Our mission is to provide engaging, interactive games that help players learn about Pokemon statistics, types, and characteristics while having fun. All games are completely free to play and require no registration.
            </p>
            <p>
              Whether you're a casual Pokemon fan or a competitive trainer, our games offer challenges for all skill levels. Test your knowledge, improve your Pokemon expertise, and compete with friends through our leaderboard systems.
            </p>
          </div>
          
          <div className="about-grid">
            <div className="about-card">
              <div className="about-card-icon">📊</div>
              <h3>{t('home.about.pokestatsTitle')}</h3>
              <p>{t('home.about.pokestatsText')}</p>
            </div>
            
            <div className="about-card">
              <div className="about-card-icon">❓</div>
              <h3>{t('home.about.pokequizzTitle')}</h3>
              <p>{t('home.about.pokequizzText')}</p>
            </div>

            <div className="about-card">
              <div className="about-card-icon">⚡</div>
              <h3>{t('home.about.pokeclickerTitle')}</h3>
              <p>{t('home.about.pokeclickerText')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}