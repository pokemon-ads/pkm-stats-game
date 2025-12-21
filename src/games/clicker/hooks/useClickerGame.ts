import { useContext, useEffect, useRef } from 'react';
import { ClickerContext } from '../context/ClickerContext';

export const useClickerGame = () => {
  const context = useContext(ClickerContext);
  const lastTickRef = useRef<number>(Date.now());

  if (!context) {
    throw new Error('useClickerGame must be used within a ClickerProvider');
  }

  const { state, dispatch, resetGame } = context;

  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000; // Convert to seconds

      if (delta > 0) {
        dispatch({ type: 'TICK', payload: { delta } });
        lastTickRef.current = now;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dispatch]);

  const handleClick = () => {
    dispatch({ type: 'CLICK' });
  };

  return {
    state,
    handleClick,
    resetGame,
  };
};