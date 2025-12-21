import { useContext, useCallback } from 'react';
import { ClickerContext } from '../context/ClickerContext';

export const useClickerGame = () => {
  const context = useContext(ClickerContext);

  if (!context) {
    throw new Error('useClickerGame must be used within a ClickerProvider');
  }

  const { state, dispatch, resetGame } = context;

  // Memoize handleClick to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    dispatch({ type: 'CLICK' });
  }, [dispatch]);

  return {
    state,
    handleClick,
    resetGame,
  };
};