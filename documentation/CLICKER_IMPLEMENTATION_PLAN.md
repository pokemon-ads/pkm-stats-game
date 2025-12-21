# Plan d'Implémentation - PokéClicker

Ce document détaille les étapes d'implémentation pour le jeu "PokéClicker" basé sur le cahier des charges `CLICKER.MD`.

## Phase 1 : Architecture & Boucle de Jeu (Core)

Cette phase met en place les fondations techniques et la boucle de gameplay minimale.

- [ ] **Structure du projet**
    - Créer le dossier `src/games/pokeclicker`
    - Créer l'arborescence : `components`, `hooks`, `config`, `types`, `utils`, `styles`
    - Définir les types TypeScript de base dans `types/game.ts` (`GameState`, `Resources`, `SaveData`)

- [ ] **Moteur de jeu (Game Loop)**
    - Créer le hook `useGameLoop` (tick régulier via `requestAnimationFrame` ou `setInterval`)
    - Implémenter le calcul du `deltaSeconds` pour la précision temporelle
    - Gérer l'état de l'Énergie (actuelle, totale, dépensée)

- [ ] **Interface de base (UI)**
    - Créer le composant racine `PokeClickerGame.tsx`
    - Créer `GameView` (layout principal)
    - Créer `TopStatsBar` (affichage E, E/s, E/clic)
    - Créer `BigEnergyButton` (zone de clic centrale)
    - Intégrer le jeu dans le routing de l'application (`App.tsx`)

- [ ] **Logique de Clic**
    - Implémenter la fonction `handleClick`
    - Calculer le gain de base (E/clic)
    - Ajouter un feedback visuel minimal (console ou UI temporaire)

## Phase 2 : Système de Sauvegarde & Persistance

Cette phase assure que la progression du joueur est conservée et sécurisée.

- [ ] **Gestion de la Sauvegarde**
    - Créer le hook `useSaveGame`
    - Définir la structure `SaveV1` selon le cahier des charges
    - Implémenter `saveToLocalStorage` (clé `poke-clicker-save`)
    - Implémenter `loadFromLocalStorage` avec validation basique
    - Configurer l'auto-save (intervalle 10-15s + `visibilitychange`)

- [ ] **Progression Hors-ligne (Offline Progress)**
    - Calculer le temps écoulé depuis la dernière sauvegarde (`savedAt`)
    - Appliquer le gain passif (E/s * temps) avec un plafond (ex: 8h)
    - Afficher une notification/modal au retour du joueur résumant les gains

- [ ] **Gestion des Données (Settings)**
    - Créer `SettingsModal`
    - Implémenter l'Export de sauvegarde (JSON/Base64)
    - Implémenter l'Import de sauvegarde avec validation et migration
    - Ajouter l'option "Hard Reset"

## Phase 3 : Système de Pokémon Helpers

Le cœur du thème : les Pokémon qui génèrent de l'énergie passivement.

- [ ] **Configuration & Données**
    - Créer `config/pokemons.ts` avec le catalogue statique (6-12 Pokémon initiaux)
    - Définir les coûts de base, coefficients de croissance (1.25-1.35), et bonus (E/s)

- [ ] **Logique Métier**
    - Implémenter l'achat/déblocage de Pokémon
    - Implémenter la montée de niveau (Level Up)
    - Calculer le coût dynamique : `baseCost * (growthFactor ^ level)`
    - Calculer le E/s total généré par les Pokémon

- [ ] **Interface Utilisateur**
    - Créer le composant `PokemonCard` (image, niveau, coût, bonus)
    - Créer le panneau `PokemonPanel` listant les helpers
    - Connecter les actions d'achat à l'état global

## Phase 4 : Boutique d'Améliorations (Upgrades)

Pour dynamiser le gameplay et offrir des choix stratégiques.

- [ ] **Configuration & Données**
    - Créer `config/upgrades.ts` avec le catalogue (10-20 upgrades initiaux)
    - Types d'effets : `CLICK_FLAT`, `CLICK_MULT`, `GLOBAL_PROD_MULT`, `PASSIVE_FLAT`

- [ ] **Logique Métier**
    - Gérer l'état des upgrades (achetés/verrouillés)
    - Appliquer les bonus aux calculs de `energyPerClick` et `energyPerSecond`
    - Gérer les conditions de déblocage (ex: posséder X énergie totale)

- [ ] **Interface Utilisateur**
    - Créer le composant `UpgradeCard`
    - Créer le panneau `ShopPanel`
    - Gérer l'état visuel (disponible, trop cher, acheté)

## Phase 5 : Paliers & Polish UI

Finitions et structure de progression.

- [ ] **Système de Paliers (Milestones)**
    - Définir les seuils de déblocage (Contenu progressif)
    - Masquer les fonctionnalités/onglets non découverts
    - Créer `ToastUnlock` pour notifier les nouveaux déblocages

- [ ] **Améliorations Visuelles & UX**
    - Créer l'utilitaire `NumberFormat` (affichage 1.2k, 1M, 1B)
    - Ajouter des animations au clic (pop numbers)
    - Styliser l'interface (CSS/Modules) pour un look "Pokémon"
    - Assurer le responsive mobile

- [ ] **Équilibrage (Balancing)**
    - Tester la courbe de progression (0-90 min)
    - Ajuster les coûts et les gains pour éviter les blocages ou les progressions trop rapides