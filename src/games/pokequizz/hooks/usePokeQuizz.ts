import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { pokemonService } from '../../../services/pokemon.service';
import { GENERATIONS } from '../../../types/pokemon';
import { DEFAULT_SETTINGS, INITIAL_STATS } from '../config/constants';
import { normalizeText } from '../utils/textNormalization';
import type { GameState, GameSettings, GameStats, Difficulty } from '../types/game';

export const usePokeQuizz = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [gameState, setGameState] = useState<GameState>({
    status: 'loading',
    currentPokemon: null,
    startTime: null,
    userGuess: '',
    isCorrect: null
  });

  const getRandomPokemonId = useCallback(() => {
    let min = 1;
    let max = 1025;

    if (settings.generation > 0) {
      const gen = GENERATIONS[settings.generation as keyof typeof GENERATIONS];
      if (gen) {
        [min, max] = gen.range;
      }
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, [settings.generation]);

  const fetchNextPokemon = useCallback(async () => {
    // Don't reset state immediately to avoid flickering
    // setGameState(prev => ({ ...prev, status: 'loading', isCorrect: null, userGuess: '' }));
    
    try {
      const id = getRandomPokemonId();
      const pokemon = await pokemonService.getPokemon(id);
      
      // Preload image
      const img = new Image();
      img.src = pokemon.sprites.front_default;
      img.onload = () => {
        setGameState(prev => ({
          ...prev,
          status: 'playing',
          currentPokemon: pokemon,
          startTime: Date.now(),
          isCorrect: null,
          userGuess: ''
        }));
      };
    } catch (error) {
      console.error('Error fetching pokemon:', error);
      // Retry on error
      setTimeout(fetchNextPokemon, 1000);
    }
  }, [getRandomPokemonId]);

  // Initial fetch
  useEffect(() => {
    if (!gameState.currentPokemon) {
      fetchNextPokemon();
    }
  }, []);

  const handleGuess = useCallback((guess: string) => {
    if (gameState.status !== 'playing' || !gameState.currentPokemon) return;

    const normalizedGuess = normalizeText(guess);
    const currentLang = i18n.language.split('-')[0]; // 'en' or 'fr'
    
    // Check against both English and French names
    const normalizedEnName = normalizeText(gameState.currentPokemon.names?.en || gameState.currentPokemon.name);
    const normalizedFrName = normalizeText(gameState.currentPokemon.names?.fr || gameState.currentPokemon.name);
    const normalizedApiName = normalizeText(gameState.currentPokemon.name);

    const isCorrect = 
      normalizedGuess === normalizedEnName || 
      normalizedGuess === normalizedFrName || 
      normalizedGuess === normalizedApiName;

    if (isCorrect) {
      if (settings.soundEnabled && gameState.currentPokemon?.cries?.latest) {
        const audio = new Audio(gameState.currentPokemon.cries.latest);
        audio.volume = 0.5;
        audio.play().catch(e => console.error('Error playing cry:', e));
      }

      const timeTaken = Date.now() - (gameState.startTime || Date.now());
      
      setStats(prev => {
        const newCorrectCount = prev.correctCount + 1;
        const newTotalCount = prev.totalCount + 1;
        const newCurrentStreak = prev.currentStreak + 1;
        
        // Calculate new average time
        // (old_avg * old_count + new_time) / new_count
        // Note: We only average correct guesses times or all times? Usually correct guesses.
        // Let's average only correct guesses for "Time Taken" stats usually.
        const newAverageTime = prev.averageTime === 0
          ? timeTaken
          : ((prev.averageTime * prev.correctCount) + timeTaken) / newCorrectCount;

        return {
          ...prev,
          correctCount: newCorrectCount,
          totalCount: newTotalCount,
          currentStreak: newCurrentStreak,
          bestStreak: Math.max(prev.bestStreak, newCurrentStreak),
          lastTime: timeTaken,
          averageTime: newAverageTime
        };
      });

      setGameState(prev => ({
        ...prev,
        status: 'revealed',
        isCorrect: true,
        userGuess: guess
      }));

      // Auto next after delay
      setTimeout(() => {
        fetchNextPokemon();
      }, 2000);

    } else {
      if (settings.soundEnabled) {
        // Optional: Sound for wrong guess? Maybe just for give up.
      }
      // Wrong guess logic? 
      // Requirements say "Who's that Pokemon? style". Usually you get one try or unlimited tries?
      // "User types the name".
      // If we want strict streak, any wrong submission resets streak.
      // But usually in these games you just type until you get it right or give up.
      // Let's assume unlimited tries until "Give Up" is pressed, unless we want to penalize spamming.
      // For now, just update the input state, don't fail the round yet.
      setGameState(prev => ({ ...prev, userGuess: guess }));
    }
  }, [gameState.status, gameState.currentPokemon, gameState.startTime, i18n.language, fetchNextPokemon]);

  const handleGiveUp = useCallback(() => {
    if (gameState.status !== 'playing') return;

    if (settings.soundEnabled && gameState.currentPokemon?.cries?.latest) {
      const audio = new Audio(gameState.currentPokemon.cries.latest);
      audio.volume = 0.5;
      audio.play().catch(e => console.error('Error playing cry:', e));
    }

    setStats(prev => ({
      ...prev,
      currentStreak: 0,
      totalCount: prev.totalCount + 1
    }));

    setGameState(prev => ({
      ...prev,
      status: 'revealed',
      isCorrect: false
    }));

    // Auto next after delay
    setTimeout(() => {
      fetchNextPokemon();
    }, 3000);
  }, [gameState.status, fetchNextPokemon, settings.soundEnabled, i18n.language, t]);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Effect to handle generation changes
  useEffect(() => {
    // Only fetch if we are not already loading (to avoid double fetch on mount)
    // and if the generation actually changed (handled by dependency array)
    if (gameState.status !== 'loading') {
      fetchNextPokemon();
    }
  }, [settings.generation]);

  return {
    gameState,
    settings,
    stats,
    handleGuess,
    handleGiveUp,
    updateSettings,
    playCry: useCallback(() => {
      if (gameState.currentPokemon?.cries?.latest) {
        const audio = new Audio(gameState.currentPokemon.cries.latest);
        audio.volume = 0.5;
        audio.play().catch(e => console.error('Error playing cry:', e));
      }
    }, [gameState.currentPokemon])
  };
};