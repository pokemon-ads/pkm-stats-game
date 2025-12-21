# PokeQuizz Improvement Proposals

This document outlines potential improvements for the PokeQuizz game to enhance gameplay, user experience, and technical quality.

## 1. Gameplay Features

### New Game Modes
- **Time Attack (Chrono):**
  - Goal: Guess as many Pokémon as possible within a time limit (e.g., 60 seconds).
  - Bonus time for correct answers.
  - Leaderboard specific to this mode.
- **Survival (Sudden Death):**
  - The game ends immediately upon the first wrong guess.
  - Track the highest streak.
- **Cry Mode (Blind Test):**
  - The image is hidden (or shows a generic Pokéball).
  - The player hears the Pokémon's cry and must guess the name.
  - The image is revealed only after the guess or give up.
- **Silhouette Mode:**
  - Instead of blurring/rotating, render a pure black silhouette of the Pokémon.
  - Slowly reveal the colors as time passes (optional hint system).
- **Daily Challenge:**
  - A set sequence of 5-10 Pokémon that is the same for all players every day.
  - Compare scores with friends.

### Difficulty & Progression
- **Smart Difficulty:**
  - Start easy (popular Pokémon like Pikachu, Charizard).
  - As the streak increases, introduce more obscure Pokémon.
- **Hint System:**
  - Spend "points" (earned from correct guesses) to get hints:
    - Show first letter.
    - Show type(s).
    - Show generation.
- **Achievements/Badges:**
  - "Kanto Master" (Streak of 10 on Gen 1).
  - "Speedster" (Answer in under 2 seconds).

## 2. UI/UX Improvements

### Visual Feedback & Animations
- **Reveal Animation:**
  - Instead of an instant switch, add a "flash" effect or a fade-in transition when the Pokémon is revealed.
- **Input Feedback:**
  - Shake the input field on a wrong guess.
  - Green glow/particles on a correct guess.
  - "Close Call": If the user makes a small typo (e.g., "Pikachou" instead of "Pikachu"), show a warning like "You are close!" (using Levenshtein distance).
- **Confetti:**
  - Trigger confetti explosion on new best streaks or milestones (10, 20, 50).

### Audio
- **Sound Effects:**
  - Distinct sounds for Correct, Wrong, and New High Score.
  - Option to toggle SFX separately from Cries.
- **Background Music:**
  - Optional lo-fi or 8-bit Pokémon-style background music.

### Mobile Experience
- **Virtual Keyboard:**
  - Ensure the native keyboard doesn't hide the image on mobile.
  - Consider a custom letter-scramble input (like Wordle/4 Pics 1 Word) for an easier mode.

## 3. Technical & Code Quality

### Refactoring
- **Canvas Logic:**
  - Extract the Canvas rendering logic (rotation, blur, silhouette) into a dedicated `usePokemonCanvas` hook or a `<PokemonSprite />` component to clean up `QuizzCard.tsx`.
- **State Management:**
  - If multiple modes are added, migrate `usePokeQuizz` state to a `useReducer` to handle complex transitions and mode-specific logic cleanly.

### Performance
- **Preloading:**
  - Ensure the next Pokémon's image and cry are preloaded in the background to minimize wait times between rounds.
- **Caching:**
  - Cache fetched Pokémon data to avoid repeated API calls for the same ID in a session.

### Accessibility
- **Keyboard Navigation:**
  - Ensure full keyboard support (Enter to submit, Esc to give up/skip).
- **Screen Readers:**
  - Add appropriate ARIA labels, though the core game is visual/audio based.

## 4. Proposed Roadmap

1.  **Phase 1: Polish (Quick Wins)**
    - Implement "Close!" typo detection.
    - Add reveal animations 
    - turn on off pokemon cries
    - Refactor Canvas logic.
2.  **Phase 2: New Modes**
    - Add "Time Attack" and "Survival" modes.
    - Implement the mode selector UI.
3.  **Phase 3: Advanced Features**
    - Daily Challenge backend integration.
    - Leaderboards.