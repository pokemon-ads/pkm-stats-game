import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '../styles/Home.css'

// Animated Pokemon sprites for the hero section
const HERO_POKEMON = [25, 1, 4, 7, 150, 151, 133, 143, 94, 130];

export const Home = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentPokemon, setCurrentPokemon] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentPokemon(prev => (prev + 1) % HERO_POKEMON.length)
    }, 3000)
    return () => clearInterval(interval)
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
                    <span>{t('home.letsPlay')}</span>
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