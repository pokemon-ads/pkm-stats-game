import React, { memo, useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

// Generate particles once at module level to avoid recreating on every render
const generateParticles = (): Particle[] => {
  const particles: Particle[] = [];
  // Reduced from 15 to 8 particles for better performance
  for (let i = 0; i < 8; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 20,
      duration: 15 + Math.random() * 10,
      size: 20 + Math.random() * 30,
    });
  }
  return particles;
};

const STATIC_PARTICLES = generateParticles();

export const BackgroundEffects: React.FC = memo(() => {
  // Use static particles instead of state
  const particles = useMemo(() => STATIC_PARTICLES, []);

  return (
    <div className="background-pokeballs">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="floating-pokeball"
          style={{
            left: `${particle.x}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#ff0000" stroke="#333" strokeWidth="4"/>
            <rect x="0" y="46" width="100" height="8" fill="#333"/>
            <circle cx="50" cy="50" r="48" fill="transparent" stroke="#333" strokeWidth="4"/>
            <path d="M 0 50 A 48 48 0 0 1 100 50" fill="#ff0000"/>
            <path d="M 0 50 A 48 48 0 0 0 100 50" fill="#fff"/>
            <circle cx="50" cy="50" r="16" fill="#fff" stroke="#333" strokeWidth="4"/>
            <circle cx="50" cy="50" r="8" fill="#333"/>
          </svg>
        </div>
      ))}
      
      {/* Animated gradient orbs */}
      <div className="gradient-orb orb-1" />
      <div className="gradient-orb orb-2" />
      <div className="gradient-orb orb-3" />
      
      <style>{`
        .background-pokeballs {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }
        
        .floating-pokeball {
          position: absolute;
          opacity: 0.08;
          animation: floatUp linear infinite;
          bottom: -100px;
        }
        
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.08;
          }
          90% {
            opacity: 0.08;
          }
          100% {
            transform: translateY(-120vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: orbFloat 8s ease-in-out infinite;
        }
        
        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%);
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .orb-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 203, 5, 0.3) 0%, transparent 70%);
          top: 50%;
          right: 10%;
          animation-delay: 2s;
        }
        
        .orb-3 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(59, 76, 202, 0.3) 0%, transparent 70%);
          bottom: 10%;
          left: 30%;
          animation-delay: 4s;
        }
        
        @keyframes orbFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -30px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 10px) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
});

BackgroundEffects.displayName = 'BackgroundEffects';