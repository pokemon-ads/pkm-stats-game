import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { pokemonService } from '../../../services/pokemon.service';
import { GENERATIONS, type Pokemon } from '../../../types/pokemon';
import { DEFAULT_SETTINGS, INITIAL_STATS, TIME_ATTACK_DURATION } from '../config/constants';
import { normalizeText } from '../utils/textNormalization';
import type { GameState, GameSettings, GameStats, Difficulty } from '../types/game';

export const usePokeQuizz = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const requestRef = useRef(0);
  const nextPokemonRef = useRef<{ pokemon: Pokemon; image: HTMLImageElement } | null>(null);
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
    // #region agent log
    const fetchStart = Date.now();
    fetch('http://127.0.0.1:7242/ingest/9a77cddd-fb46-4bc0-be08-45e0027b17d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usePokeQuizz.ts:80',message:'fetchNextPokemon called',data:{requestId:requestRef.current+1,hasPreloaded:!!nextPokemonRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    requestRef.current += 1;
    const requestId = requestRef.current;

    const applyPokemon = (pokemon: Pokemon) => {
      if (requestId !== requestRef.current) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9a77cddd-fb46-4bc0-be08-45e0027b17d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usePokeQuizz.ts:85',message:'applyPokemon cancelled',data:{requestId,currentRequestId:requestRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return;
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9a77cddd-fb46-4bc0-be08-45e0027b17d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usePokeQuizz.ts:87',message:'applyPokemon success',data:{requestId,pokemonId:pokemon.id,fetchTime:Date.now()-fetchStart},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9a77cddd-fb46-4bc0-be08-45e0027b17d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usePokeQuizz.ts:119',message:'fetchNextPokemon error',data:{requestId,error:error instanceof Error?error.message:'unknown',willRetry:requestId===requestRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.error('Error fetching pokemon:', error);
      if (requestId === requestRef.current) {
        setTimeout(fetchNextPokemon, 1000);
      }
    }
  }, [getRandomPokemonId, preloadNextPokemon]);

  // Initial fetch
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9a77cddd-fb46-4bc0-be08-45e0027b17d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usePokeQuizz.ts:127',message:'Initial fetch effect triggered',data:{hasCurrentPokemon:!!gameState.currentPokemon,status:gameState.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!gameState.currentPokemon) {
      fetchNextPokemon();
    }
  }, [fetchNextPokemon, gameState.currentPokemon]);

  const handleGuess = useCallback((guess: string) => {
    if (gameState.status !== 'playing' || !gameState.currentPokemon) return;

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

      // Auto next after delay
      setTimeout(() => {
        fetchNextPokemon();
      }, 2000);

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

        // Auto next (restart) after delay? Or show Game Over screen?
        // For now, just reveal and next.
        setTimeout(() => {
          fetchNextPokemon();
        }, 3000);
      } else {
        // Normal mode: unlimited tries
        setGameState(prev => ({ ...prev, userGuess: guess }));
      }
    }
  }, [gameState.status, gameState.currentPokemon, gameState.startTime, fetchNextPokemon, settings]);

  const handleGiveUp = useCallback(() => {
    if (gameState.status !== 'playing') return;

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

    // Auto next after delay
    setTimeout(() => {
      fetchNextPokemon();
    }, 3000);
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9a77cddd-fb46-4bc0-be08-45e0027b17d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usePokeQuizz.ts:274',message:'Generation/mode change effect triggered',data:{generation:settings.generation,mode:settings.mode,status:gameState.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // Only fetch if we are not already loading (to avoid double fetch on mount)
    // and if the generation actually changed (handled by dependency array)
    if (gameState.status !== 'loading') {
      fetchNextPokemon();
    }
  }, [settings.generation, settings.mode, fetchNextPokemon, gameState.status]);

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
        audio.volume = settings.cryVolume;
        audio.play().catch(e => console.error('Error playing cry:', e));
      }
    }, [gameState.currentPokemon, settings.cryVolume])
  };
};