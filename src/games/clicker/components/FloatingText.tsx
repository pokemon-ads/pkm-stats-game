import React, { useEffect, useState } from 'react';

interface FloatingTextProps {
  x: number;
  y: number;
  text: string;
  onComplete: () => void;
}

export const FloatingText: React.FC<FloatingTextProps> = ({ x, y, text, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="floating-text-container"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <span className="floating-text-value">{text}</span>
      
      <style>{`
        .floating-text-container {
          animation: floatUpFade 0.8s ease-out forwards;
        }
        
        .floating-text-value {
          font-weight: 900;
          font-size: 2rem;
          color: #ffcb05;
          text-shadow: 
            0 0 10px rgba(255, 203, 5, 0.8),
            0 0 20px rgba(255, 203, 5, 0.5),
            2px 2px 0 #3b4cca,
            -1px -1px 0 #3b4cca;
          transform: translate(-50%, -50%);
          display: block;
          white-space: nowrap;
        }
        
        @keyframes floatUpFade {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.5);
          }
          20% {
            transform: translate(-50%, -70%) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -150%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};