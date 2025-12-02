
# PokéStats Challenge - Documentation Complète

## 📋 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Concept du jeu](#concept-du-jeu)
3. [Architecture technique](#architecture-technique)
4. [Fonctionnalités détaillées](#fonctionnalités-détaillées)
5. [Structure des fichiers](#structure-des-fichiers)
6. [Configuration et constantes](#configuration-et-constantes)
7. [Système de filtres](#système-de-filtres)
8. [Mécaniques de jeu](#mécaniques-de-jeu)
9. [Interface utilisateur](#interface-utilisateur)
10. [Stockage local](#stockage-local)
11. [Guide de modification](#guide-de-modification)

---

## 🎯 Vue d'ensemble

**PokéStats Challenge** est un jeu de devinettes basé sur les statistiques des Pokémon. Le joueur doit deviner quelle statistique d'un Pokémon est la plus élevée, sans voir les valeurs au préalable (mode "blind").

### Technologies utilisées
- **React 18** avec TypeScript
- **pokeapi-js-wrapper** pour récupérer les données Pokémon depuis PokeAPI
- **CSS moderne** avec animations et effets visuels
- **localStorage** pour la persistance des préférences utilisateur

---

## 🎮 Concept du jeu

### Objectif
Atteindre ou dépasser un score cible en sélectionnant les meilleures statistiques de 6 Pokémon tirés aléatoirement.

### Déroulement d'une partie
1. **Configuration** : Le joueur définit l'objectif de score et applique des filtres optionnels
2. **6 Manches** : Pour chaque Pokémon tiré, le joueur choisit une statistique parmi celles disponibles
3. **Révélation** : Les valeurs sont révélées après confirmation
4. **Résultat** : Victoire si le total ≥ objectif, défaite sinon

### Statistiques disponibles
Chaque Pokémon possède 6 statistiques (utilisées une seule fois par partie) :
- **HP** (Points de Vie)
- **Attack** (Attaque)
- **Defense** (Défense)
- **Special Attack** (Attaque Spéciale)
- **Special Defense** (Défense Spéciale)
- **Speed** (Vitesse)

---

## 🏗️ Architecture technique

### Structure React
```
App.tsx (Composant principal)
├── GameConfig (Panneau latéral de configuration)
├── GameSetup (Écran de configuration initiale)
├── PokemonCard (Carte de jeu avec sélection de stats)
├── GameResult (Écran de résultat)
└── ActiveFilters (Panneau des filtres actifs)
```

### Hook principal : `usePokeGame`
Gère tout l'état du jeu et la logique métier :
- État du jeu (phase, score, Pokémon actuel, etc.)
- Génération du pool de Pokémon selon les filtres
- Tirage aléatoire des Pokémon
- Gestion des sélections et calcul des scores
- Persistance des préférences

### Phases du jeu
Définies dans `GAME_PHASES` (constants.ts) :
- **SETUP** : Configuration initiale
- **PLAYING** : Partie en cours
- **RESULT** : Affichage du résultat

---

## ✨ Fonctionnalités détaillées

### 1. Système de filtres avancé

#### Modes de filtrage
- **Mode AND (Restrictif)** 🔒 : Intersection des filtres (Pokémon doit correspondre à TOUS les critères)
- **Mode OR (Additif)** ➕ : Union des filtres (Pokémon doit correspondre à AU MOINS UN critère)

#### Types de filtres disponibles

##### Générations (sélection multiple)
- Gen 1 à Gen 9
- Plages d'IDs définies dans `GENERATIONS` (types/pokemon.ts)

##### Types Pokémon (sélection multiple)
- 18 types disponibles : Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy
- Icônes emoji pour chaque type dans `TYPE_ICONS`

##### Catégories spéciales
- **Légendaires** 🌟 : Liste dans `LEGENDARY_IDS`
- **Mythiques** ✨ : Liste dans `MYTHICAL_IDS`
- **Ultra-Chimères** 👾 : Liste dans `ULTRA_BEAST_IDS`
- **Pokémon Paradox** ⚡ : Liste dans `PARADOX_IDS`

##### Formes spéciales
- **Méga-évolutions** 💎 : Liste dans `MEGA_EVOLUTION_IDS` et `MEGA_FORMS`
- **Gigantamax** 🔶 : Liste dans `GIGANTAMAX_IDS` et `GIGANTAMAX_FORMS`
- **Legends Z-A** 🔷 : Méga-évolutions spécifiques dans `LEGENDS_ZA_MEGA_IDS`

##### Formes régionales (sélection multiple)
- **Alola** 🌺 : Formes d'Alola dans `ALOLA_FORM_IDS`
- **Galar** ⚔️ : Formes de Galar dans `GALAR_FORM_IDS`
- **Hisui** 🏔️ : Formes de Hisui dans `HISUI_FORM_IDS`
- **Paldea** 🌄 : Formes de Paldea dans `PALDEA_FORM_IDS`

### 2. Système de Pokémon Shiny

#### Probabilité
- 1/128 par défaut (`GAME_CONFIG.SHINY_PROBABILITY`)
- Affichage visuel avec badge "✨ Shiny!" doré et animé

#### Bonus Shiny (optionnel)
- Multiplicateur x2 sur les statistiques (`GAME_CONFIG.SHINY_BONUS_MULTIPLIER`)
- Activable/désactivable dans le panneau GameConfig
- Sauvegardé dans localStorage (`STORAGE_KEYS.SHINY_BONUS`)

### 3. Mode rapide

#### Fonctionnalité
- Désactive la modale de confirmation lors de la sélection d'une statistique
- Sélection directe et immédiate
- Sauvegardé dans localStorage (`STORAGE_KEYS.SKIP_CONFIRMATION`)

### 4. Configuration du score cible

#### Paramètres
- **Par défaut** : 600 points (`GAME_CONFIG.DEFAULT_TARGET_TOTAL`)
- **Minimum** : 100 points (`GAME_CONFIG.MIN_TARGET_TOTAL`)
- **Maximum** : 1000 points (`GAME_CONFIG.MAX_TARGET_TOTAL`)
- **Pas d'ajustement** : 50 points (`GAME_CONFIG.TARGET_STEP`)

#### Ajustement automatique
Après une partie, boutons pour rejouer avec :
- **Victoire** : +50 ou +100 points
- **Défaite** : -50 ou -100 points

---

## 📁 Structure des fichiers

### Composants React (`src/components/`)

#### `GameSetup.tsx`
**Rôle** : Écran de configuration initiale
**Props** : `onStart(targetTotal, filters, skipConfirmation)`
**Fonctionnalités** :
- Sélection de l'objectif de score
- Configuration des filtres (générations, types, catégories, formes)
- Choix du mode de filtrage (AND/OR)
- Bouton de démarrage

#### `PokemonCard.tsx`
**Rôle** : Affichage du Pokémon et sélection de statistique
**Props** :
- `pokemon` : Pokémon actuel
- `availableStats` : Statistiques encore disponibles
- `selectedStatName` : Statistique sélectionnée
- `statsRevealed` : État de révélation
- `onSelectStatName` : Callback de sélection
- `onConfirmSelection` : Callback de confirmation
- `round` : Numéro de la manche
- `selectedStats` : Historique des sélections
- `skipConfirmation` : Mode rapide activé

**Affichage** :
- Sprite du Pokémon (normal ou shiny)
- Badge shiny si applicable
- Numéro et types du Pokémon
- Grille de 6 statistiques (mystery cards ou valeurs révélées)
- Sprites des Pokémon précédents sur les stats déjà choisies
- Modale de confirmation (si mode rapide désactivé)

#### `GameResult.tsx`
**Rôle** : Écran de résultat final
**Props** :
- `gameState` : État complet du jeu
- `totalStats` : Score total obtenu
- `won` : Victoire ou défaite
- `difference` : Différence avec l'objectif
- `onReset` : Retour à la configuration
- `onRestartWithSameFilters` : Rejouer avec même objectif
- `onRestartWithAdjustedTarget` : Rejouer avec objectif ajusté

**Affichage** :
- Titre (🎉 Victoire / 😢 Défaite)
- Comparaison score vs objectif
- Récapitulatif des 6 sélections avec sprites
- Boutons d'action (rejouer, ajuster, changer filtres)

#### `ActiveFilters.tsx`
**Rôle** : Panneau latéral droit affichant les filtres actifs
**Props** :
- `filters` : Filtres appliqués
- `targetTotal` : Objectif de score

**Affichage** :
- Mode de filtrage (Additif/Restrictif)
- Objectif de score
- Générations sélectionnées
- Types sélectionnés avec icônes
- Catégories spéciales actives
- Formes spéciales actives
- Formes régionales sélectionnées

#### `GameConfig.tsx`
**Rôle** : Panneau latéral gauche de configuration
**Props** :
- `skipConfirmation` : État du mode rapide
- `shinyBonus` : État du bonus shiny
- `onSkipConfirmationChange` : Callback de modification
- `onShinyBonusChange` : Callback de modification

**Fonctionnalités** :
- Bouton collapse/expand (◀/▶)
- Switch "Mode rapide"
- Switch "Bonus Shiny x2"
- Sauvegarde automatique dans localStorage

### Hook personnalisé (`src/hooks/`)

#### `usePokeGame.ts`
**État géré** :
```typescript
gameState: {
  phase: 'setup' | 'playing' | 'result'
  targetTotal: number
  currentRound: number
  selectedStats: Array<{pokemon, statName, value}>
  currentPokemon: Pokemon | null
  availableStats: StatName[]
  selectedStatName: StatName | null
  statsRevealed: boolean
}
filters: FilterOptions
pokemonPool: number[]
loading: boolean
skipConfirmation: boolean
shinyBonus: boolean
```

**Fonctions principales** :
- `generatePokemonPool(filters)` : Génère le pool selon les filtres
- `fetchPokemonForm(id, useMega, useGigantamax, regionalForms)` : Récupère la forme spéciale
- `startGame(target, filters, skipMode)` : Démarre une partie
- `drawPokemon()` : Tire un Pokémon aléatoire
- `selectStatName(stat)` : Sélectionne une statistique
- `confirmSelection()` : Confirme la sélection
- `calculateResult()` : Calcule le résultat final
- `resetGame()` : Retour à la configuration
- `restartWithSameFilters()` : Rejouer avec mêmes paramètres
- `restartWithAdjustedTarget(adjustment)` : Rejouer avec objectif ajusté

### Types TypeScript (`src/types/pokemon.ts`)

#### Interfaces principales
```typescript
interface Pokemon {
  id: number
  name: string
  sprites: {
    front_default: string
    front_shiny: string
  }
  stats: Array<{
    base_stat: number
    stat: { name: StatName }
  }>
  types: Array<{
    type: { name: string }
  }>
  isShiny?: boolean
}

interface GameState {
  phase: 'setup' | 'playing' | 'result'
  targetTotal: number
  currentRound: number
  selectedStats: Array<{
    pokemon: Pokemon
    statName: StatName
    value: number
  }>
  currentPokemon: Pokemon | null
  availableStats: StatName[]
  selectedStatName: StatName | null
  statsRevealed: boolean
}

interface FilterOptions {
  generation?: string
  generations?: string[]
  types?: string[]
  legendary?: boolean
  mythical?: boolean
  mega?: boolean
  gigantamax?: boolean
  ultraBeast?: boolean
  legendsZA?: boolean
  paradox?: boolean
  regionalForm?: string
  regionalForms?: string[]
  filterMode?: 'AND' | 'OR'
}
```

#### Constantes de données
- `GENERATIONS` : Plages d'IDs par génération
- `POKEMON_TYPES` : Liste des 18 types
- `LEGENDARY_IDS` : IDs des Pokémon légendaires
- `MYTHICAL_IDS` : IDs des Pokémon mythiques
- `MEGA_EVOLUTION_IDS` : IDs des Pokémon avec méga-évolution
- `MEGA_FORMS` : Mapping ID → nom(s) de méga-forme
- `GIGANTAMAX_IDS` : IDs des Pokémon Gigantamax
- `GIGANTAMAX_FORMS` : Mapping ID → nom de forme Gigantamax
- `ULTRA_BEAST_IDS` : IDs des Ultra-Chimères
- `LEGENDS_ZA_MEGA_IDS` : IDs des méga-évolutions Legends Z-A
- `PARADOX_IDS` : IDs des Pokémon Paradox
- `ALOLA_FORM_IDS`, `GALAR_FORM_IDS`, `HISUI_FORM_IDS`, `PALDEA_FORM_IDS` : IDs des formes régionales
- `REGIONAL_FORMS` : Mapping forme → ID → noms de variantes

### Configuration (`src/config/constants.ts`)

#### `GAME_CONFIG`
```typescript
{
  DEFAULT_TARGET_TOTAL: 600,
  MIN_TARGET_TOTAL: 100,
  MAX_TARGET_TOTAL: 1000,
  TARGET_STEP: 50,
  ROUNDS_PER_GAME: 6,
  SHINY_PROBABILITY: 128,
  SHINY_BONUS_MULTIPLIER: 2,
  AUTO_DRAW_DELAY: 3000,
  MAX_FETCH_ATTEMPTS: 50,
  RETRY_DELAY: 100
}
```

#### `POKEMON_CONFIG`
```typescript
{
  TOTAL_POKEMON: 1025,
  

## 🐛 Débogage et problèmes courants

### Pokémon ne se charge pas
**Cause** : Erreur API ou ID invalide
**Solution** : Le système retry automatiquement jusqu'à 50 fois. Vérifier la console pour les erreurs.

### Filtre ne retourne aucun Pokémon
**Cause** : Combinaison de filtres trop restrictive en mode AND
**Solution** : Utiliser le mode OR ou réduire le nombre de filtres actifs

### Sprites ne s'affichent pas
**Cause** : URL de sprite invalide ou Pokémon sans sprite shiny
**Solution** : Vérifier `pokemon.sprites.front_default` et `pokemon.sprites.front_shiny`

### localStorage ne persiste pas
**Cause** : Navigateur en mode privé ou localStorage désactivé
**Solution** : Vérifier les paramètres du navigateur

---

## 📊 Statistiques et données

### Nombre de Pokémon par catégorie
- **Total** : 1025 Pokémon (Gen 1-9)
- **Légendaires** : ~60
- **Mythiques** : ~20
- **Ultra-Chimères** : 11
- **Méga-évolutions** : ~50
- **Gigantamax** : ~30
- **Pokémon Paradox** : 16
- **Formes régionales** : ~100

### Plages de statistiques typiques
- **HP** : 1-255 (moyenne ~70)
- **Attack** : 5-190 (moyenne ~80)
- **Defense** : 5-230 (moyenne ~75)
- **Sp. Attack** : 10-194 (moyenne ~75)
- **Sp. Defense** : 20-230 (moyenne ~75)
- **Speed** : 5-200 (moyenne ~70)

### Scores moyens par objectif
- **100 points** : Très facile (1-2 stats faibles suffisent)
- **300 points** : Facile (stats moyennes)
- **600 points** : Normal (bonnes stats requises)
- **800 points** : Difficile (excellentes stats requises)
- **1000 points** : Très difficile (stats maximales requises)

---

## 🎯 Stratégies de jeu

### Pour gagner facilement
1. Activer le **Bonus Shiny x2**
2. Filtrer sur **Légendaires** ou **Méga-évolutions** (stats élevées)
3. Choisir un objectif **bas** (300-400)
4. Privilégier les stats **Attack** et **Sp. Attack** (souvent élevées)

### Pour un défi
1. Désactiver le Bonus Shiny
2. Filtrer sur **Gen 1** uniquement (stats plus basses)
3. Choisir un objectif **élevé** (800-1000)
4. Mode **AND** avec plusieurs filtres restrictifs

### Optimisation du score
- Les **Légendaires** ont généralement les meilleures stats
- Les **Méga-évolutions** ont des stats boostées
- **HP** est souvent la stat la plus élevée pour les tanks
- **Speed** est souvent la stat la plus élevée pour les sweepers

---

## 🔄 Flux de données

### Démarrage de l'application
```
App.tsx
  └─> usePokeGame() initialise l'état
      ├─> Lecture localStorage (skipConfirmation, shinyBonus)
      └─> Phase = SETUP
```

### Configuration et démarrage
```
GameSetup
  └─> Utilisateur configure filtres et objectif
      └─> Clique "Commencer"
          └─> startGame(target, filters, skipMode)
              ├─> generatePokemonPool(filters)
              │   └─> Appels API pour récupérer les types
              ├─> setPokemonPool(pool)
              └─> Phase = PLAYING
```

### Déroulement d'une manche
```
Phase PLAYING
  └─> useEffect détecte absence de currentPokemon
      └─> drawPokemon()
          ├─> Sélection aléatoire dans pool
          ├─> fetchPokemonForm(id, ...)
          │   └─> Appel PokeAPI
          ├─> Détermination shiny (1/128)
          └─> setGameState({currentPokemon, ...})
              └─> PokemonCard affiche le Pokémon
                  └─> Utilisateur sélectionne une stat
                      ├─> selectStatName(stat)
                      │   └─> Si skipConfirmation: sélection directe
                      │   └─> Sinon: affiche modale
                      └─> confirmSelection()
                          ├─> Calcul de la valeur (avec bonus shiny si actif)
                          ├─> Ajout à selectedStats
                          ├─> Retrait de availableStats
                          ├─> statsRevealed = true
                          └─> Si 6 stats: Phase = RESULT
                              └─> Sinon: currentPokemon = null
                                  └─> useEffect déclenche drawPokemon() après 3s
```

### Fin de partie
```
Phase RESULT
  └─> GameResult affiche le résultat
      └─> Utilisateur choisit une action
          ├─> resetGame() → Phase = SETUP
          ├─> restartWithSameFilters() → Nouvelle partie (mêmes paramètres)
          └─> restartWithAdjustedTarget(±50/100) → Nouvelle partie (objectif ajusté)
```

---

## 🚀 Améliorations futures possibles

### Fonctionnalités
- [ ] Mode multijoueur (compétition de scores)
- [ ] Historique des parties (meilleurs scores, statistiques)
- [ ] Achievements/Trophées
- [ ] Mode "Time Attack" (limite de temps par sélection)
- [ ] Mode "Hardcore" (une seule vie, pas de retry)
- [ ] Classement en ligne
- [ ] Partage de résultats sur réseaux sociaux
- [ ] Mode "Blind" complet (même les noms cachés)
- [ ] Hints/Indices payants (coût en points)
- [ ] Système de niveaux/progression

### Filtres additionnels
- [ ] Filtre par couleur de Pokémon
- [ ] Filtre par habitat
- [ ] Filtre par taille/poids
- [ ] Filtre par évolution (base, 1ère évo, 2ème évo)
- [ ] Filtre par capacités spéciales
- [ ] Filtre par groupe d'œuf

### Interface
- [ ] Thèmes personnalisables (dark/light, couleurs)
- [ ] Animations plus poussées
- [ ] Sons et musiques
- [ ] Mode plein écran
- [ ] Support mobile amélioré
- [ ] Tutoriel interactif
- [ ] Graphiques de statistiques (charts)

### Technique
- [ ] PWA (Progressive Web App)
- [ ] Mode hors-ligne avec cache
- [ ] Tests unitaires et E2E
- [ ] Optimisation des performances
- [ ] Lazy loading des images
- [ ] Compression des données
- [ ] Backend pour sauvegardes cloud

---

## 📚 Ressources

### APIs utilisées
- **PokeAPI** : https://pokeapi.co/
- **pokeapi-js-wrapper** : https://github.com/PokeAPI/pokeapi-js-wrapper

### Documentation React
- **React Hooks** : https://react.dev/reference/react
- **TypeScript** : https://www.typescriptlang.org/docs/

### Outils de développement
- **Vite** : https://vitejs.dev/
- **ESLint** : https://eslint.org/
- **Prettier** : https://prettier.io/

---

## 📄 Licence et crédits

### Données Pokémon
Toutes les données Pokémon proviennent de **PokeAPI** (https://pokeapi.co/)
Pokémon et tous les noms associés sont des marques déposées de Nintendo/Game Freak/Creatures Inc.

### Application
Développée avec React + TypeScript + Vite
Interface utilisateur personnalisée avec CSS moderne

---

## 📞 Contact et support

Pour toute question, suggestion ou rapport de bug concernant cette application, veuillez consulter le fichier README.md ou créer une issue sur le dépôt du projet.

---

**Dernière mise à jour** : 25 novembre 2024
**Version de l'application** : 1.0.0
**Compatibilité** : Navigateurs modernes (Chrome, Firefox, Safari, Edge)