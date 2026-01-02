import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { pokemonService } from '../../../services/pokemon.service';
import { GENERATIONS, type Pokemon } from '../../../types/pokemon';
import { DEFAULT_SETTINGS, INITIAL_STATS, TIME_ATTACK_DURATION, REVEAL_DURATION_CORRECT, REVEAL_DURATION_WRONG } from '../config/constants';
import { normalizeText } from '../utils/textNormalization';
import type { GameState, GameSettings, GameStats, Difficulty } from '../types/game';

export const usePokeQuizz = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const requestRef = useRef(0);
  const nextPokemonRef = useRef<{ pokemon: Pokemon; image: HTMLImageElement } | null>(null);
  // Store the revealed pokemon to prevent it from changing during reveal phase
  const revealedPokemonRef = useRef<Pokemon | null>(null);
  const isProcessingRef = useRef(false);
  const [gameState, setGameState] = useState<GameState>({
    status: 'loading',
    currentPokemon: null,
    startTime: null,
    userGuess: '',
    isCorrect: null,
    timeLeft: settings.mode === 'time_attack' ? TIME_ATTACK_DURATION : undefined,
    lives: settings.mode === 'survival' ? 1 : undefined
  });

  // Timer for Time Attack
  useEffect(() => {
    if (settings.mode !== 'time_attack' || gameState.status !== 'playing') return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft !== undefined && prev.timeLeft <= 0) {
          clearInterval(timer);
          return {
            ...prev,
            status: 'revealed',
            isCorrect: false,
            timeLeft: 0
          };
        }
        return {
          ...prev,
          timeLeft: (prev.timeLeft || 0) - 1
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.mode, gameState.status]);

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

  const preloadNextPokemon = useCallback(async () => {
    try {
      const id = getRandomPokemonId();
      const pokemon = await pokemonService.getPokemon(id);
      const img = new Image();
      img.src = pokemon.sprites.front_default;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      nextPokemonRef.current = { pokemon, image: img };
    } catch (error) {
      console.error('Error preloading next pokemon:', error);
    }
  }, [getRandomPokemonId]);

  const fetchNextPokemon = useCallback(async () => {
    requestRef.current += 1;
    const requestId = requestRef.current;

    const applyPokemon = (pokemon: Pokemon) => {
      if (requestId !== requestRef.current) {
        return;
      }

      // Clear the revealed pokemon ref when starting a new round
      revealedPokemonRef.current = null;
      isProcessingRef.current = false;
      
      setGameState(prev => ({
        ...prev,
        status: 'playing',
        currentPokemon: pokemon,
        startTime: Date.now(),
        isCorrect: null,
        userGuess: '',
      }));
      
      // Start preloading the next one
      preloadNextPokemon();
    };

    // Use preloaded pokemon if available
    if (nextPokemonRef.current) {
      const { pokemon } = nextPokemonRef.current;
      nextPokemonRef.current = null;
      applyPokemon(pokemon);
      return;
    }

    // Otherwise fetch normally
    try {
      const id = getRandomPokemonId();
      const pokemon = await pokemonService.getPokemon(id);
      
      const img = new Image();
      img.src = pokemon.sprites.front_default;
      img.onload = () => {
        applyPokemon(pokemon);
      };
    } catch (error) {
      console.error('Error fetching pokemon:', error);
      if (requestId === requestRef.current) {
        setTimeout(fetchNextPokemon, 1000);
      }
    }
  }, [getRandomPokemonId, preloadNextPokemon]);

  // Initial fetch
  useEffect(() => {
    if (!gameState.currentPokemon) {
      fetchNextPokemon();
    }
  }, [fetchNextPokemon, gameState.currentPokemon]);

  const handleGuess = useCallback((guess: string) => {
    if (gameState.status !== 'playing' || !gameState.currentPokemon || isProcessingRef.current) return;

    isProcessingRef.current = true;
    const normalizedGuess = normalizeText(guess);
    
    // Check against both English and French names
    const normalizedEnName = normalizeText(gameState.currentPokemon.names?.en || gameState.currentPokemon.name);
    const normalizedFrName = normalizeText(gameState.currentPokemon.names?.fr || gameState.currentPokemon.name);
    const normalizedApiName = normalizeText(gameState.currentPokemon.name);

    const isCorrect =
      normalizedGuess === normalizedEnName ||
      normalizedGuess === normalizedFrName ||
      normalizedGuess === normalizedApiName;

    if (isCorrect) {
      // Store the current pokemon for the reveal phase
      revealedPokemonRef.current = gameState.currentPokemon;
      
      if (settings.soundEnabled && gameState.currentPokemon?.cries?.latest) {
        const audio = new Audio(gameState.currentPokemon.cries.latest);
        audio.volume = settings.cryVolume;
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

      // Auto next after delay - longer to let user see the answer
      setTimeout(() => {
        fetchNextPokemon();
      }, REVEAL_DURATION_CORRECT);

    } else {
      if (settings.mode === 'survival') {
        // Game Over on first wrong answer
        setGameState(prev => ({
          ...prev,
          status: 'revealed',
          isCorrect: false,
          userGuess: guess,
          lives: 0
        }));
        
        setStats(prev => ({
          ...prev,
          currentStreak: 0,
          totalCount: prev.totalCount + 1
        }));

        // Auto next (restart) after delay
        setTimeout(() => {
          fetchNextPokemon();
        }, REVEAL_DURATION_WRONG);
      } else {
        // Normal mode: unlimited tries
        setGameState(prev => ({ ...prev, userGuess: guess }));
        isProcessingRef.current = false;
      }
    }
  }, [gameState.status, gameState.currentPokemon, gameState.startTime, fetchNextPokemon, settings]);

  const handleGiveUp = useCallback(() => {
    if (gameState.status !== 'playing' || isProcessingRef.current) return;

    isProcessingRef.current = true;

    // Store the current pokemon for the reveal phase
    revealedPokemonRef.current = gameState.currentPokemon;

    if (settings.soundEnabled && gameState.currentPokemon?.cries?.latest) {
      const audio = new Audio(gameState.currentPokemon.cries.latest);
      audio.volume = settings.cryVolume;
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

    // Auto next after delay - longer to let user see the answer
    setTimeout(() => {
      fetchNextPokemon();
    }, REVEAL_DURATION_WRONG);
  }, [gameState.status, fetchNextPokemon, settings.soundEnabled, i18n.language, t]);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Reset game state if mode changes
      if (newSettings.mode && newSettings.mode !== prev.mode) {
        setGameState(currentState => ({
          ...currentState,
          timeLeft: newSettings.mode === 'time_attack' ? TIME_ATTACK_DURATION : undefined,
          lives: newSettings.mode === 'survival' ? 1 : undefined
        }));
        // Reset stats on mode change? Maybe.
        setStats(INITIAL_STATS);
      }

      // Clear preloaded pokemon if generation changes
      if (newSettings.generation !== undefined && newSettings.generation !== prev.generation) {
        nextPokemonRef.current = null;
      }
      
      return updated;
    });
  }, []);

  // Effect to handle generation or mode changes
  useEffect(() => {
    // Only fetch if we are not already loading (to avoid double fetch on mount)
    // and if the generation actually changed (handled by dependency array)
    if (gameState.status !== 'loading') {
      fetchNextPokemon();
    }
  }, [settings.generation, settings.mode, fetchNextPokemon]);

  // Get the pokemon to display - use revealed pokemon during reveal phase, otherwise current
  const displayPokemon = gameState.status === 'revealed' && revealedPokemonRef.current
    ? revealedPokemonRef.current
    : gameState.currentPokemon;

  return {
    gameState: {
      ...gameState,
      // Override currentPokemon with the stable revealed pokemon during reveal phase
      currentPokemon: displayPokemon
    },
    settings,
    stats,
    handleGuess,
    handleGiveUp,
    updateSettings,
    playCry: useCallback(() => {
      // Use the displayed pokemon (which is stable during reveal)
      const pokemonToPlay = displayPokemon;
      if (pokemonToPlay?.cries?.latest) {
        const audio = new Audio(pokemonToPlay.cries.latest);
        audio.volume = settings.cryVolume;
        audio.play().catch(e => console.error('Error playing cry:', e));
      }
    }, [displayPokemon, settings.cryVolume])
  };
};