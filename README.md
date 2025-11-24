# PokéStats Challenge - Jeu de Statistiques Pokémon

Un jeu interactif React + TypeScript où vous devez atteindre un total de statistiques en choisissant stratégiquement parmi 6 Pokémon tirés au hasard.

## 🎮 Concept du Jeu

Le but est simple mais stratégique :
1. Définissez un objectif de stats à atteindre (par défaut 600)
2. Appliquez des filtres optionnels (région, type, légendaire, mythique, méga-évolution, gigantamax)
3. Pour chaque manche (6 au total), un Pokémon est tiré au hasard
4. **Devinez** quelle statistique est la plus élevée parmi les 6 disponibles (HP, Attaque, Défense, Att. Spé, Déf. Spé, Vitesse)
5. Les valeurs sont **cachées** jusqu'à confirmation de votre choix
6. Une fois une stat choisie, elle n'est plus disponible pour les manches suivantes
7. Après 6 manches, si votre total ≥ objectif, vous gagnez ! Sinon, vous perdez.

## ✨ Fonctionnalités

- 🎲 **Tirage aléatoire** de Pokémon depuis toutes les générations (1-9)
- 🗺️ **Filtres par région** : Kanto, Johto, Hoenn, Sinnoh, Unys, Kalos, Alola, Galar, Paldea
- 🔥 **Filtres par type** : Tous les 18 types Pokémon
- ⭐ **Filtres spéciaux** : Légendaires, Mythiques, Méga-évolutions, Gigantamax
- 🎯 **Sélection aveugle** : Devinez la meilleure stat sans voir les valeurs
- 🔍 **Révélation progressive** : Les valeurs s'affichent après confirmation
- 🔄 **Auto-avancement** : Passage automatique au prochain round après révélation
- 📊 **Suivi en temps réel** du total de stats accumulées
- 🎨 **Interface moderne** avec animations et design responsive
- 🏆 **Écran de résultats** détaillé avec récapitulatif des choix

## 🚀 Installation

```bash
npm install
```

## 💻 Développement

Démarrer le serveur de développement :

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 🏗️ Build

Compiler pour la production :

```bash
npm run build
```

## 🎯 Comment Jouer

### Étape 1 : Configuration
- Définissez votre objectif de stats (recommandé : 600 pour un défi équilibré)
- Optionnel : Filtrez par région, type, ou caractéristiques spéciales
  - **Légendaires uniquement** : Pokémon légendaires (Mewtwo, Rayquaza, etc.)
  - **Mythiques uniquement** : Pokémon mythiques (Mew, Celebi, etc.)
  - **Méga-évolutions uniquement** : Formes méga-évoluées avec leurs stats boostées
  - **Gigantamax uniquement** : Pokémon capables de Gigantamax
- ⚠️ Les filtres spéciaux réduisent considérablement le pool de Pokémon disponibles
- Cliquez sur "Commencer le jeu"

### Étape 2 : Sélection Aveugle
- Un Pokémon apparaît avec ses 6 statistiques **cachées** (affichées comme "?")
- **Devinez** quelle statistique vous pensez être la plus élevée
- Cliquez sur la stat de votre choix
- Confirmez votre sélection avec le bouton "✓ Confirmer mon choix"
- Les valeurs sont révélées après confirmation
- Les stats déjà choisies sont désactivées pour les manches suivantes

### Étape 3 : Progression Automatique
- Après révélation, le jeu passe automatiquement au prochain round après 3 secondes
- Consultez le récapitulatif de vos choix en bas de l'écran

### Étape 4 : Résultat
- Après 6 manches, découvrez si vous avez atteint l'objectif
- Consultez le récapitulatif détaillé de tous vos choix
- Rejouez pour améliorer votre stratégie !

## 🎲 Stratégies

- **Connaissance des types** : Certains types ont tendance à exceller dans certaines stats
  - Types Combat/Dragon : Attaque élevée
  - Types Psy/Spectre : Attaque Spéciale élevée
  - Types Acier/Roche : Défense élevée
  - Types Électrik/Vol : Vitesse élevée
- **Méga-évolutions** : Activez le filtre méga pour des stats garanties très élevées (total 600+)
- **Légendaires** : Stats généralement équilibrées et élevées (100+ par stat)
- **Analyse visuelle** : Certains Pokémon ont une apparence qui suggère leurs forces
- **Gestion du risque** : Les premières manches permettent plus de risques, les dernières nécessitent de la précision

## 🛠️ Technologies Utilisées

- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **pokeapi-js-wrapper** - Client pour l'API PokéAPI
- **CSS3** - Animations et design moderne

## 📁 Structure du Projet

```
pkStats/
├── src/
│   ├── components/          # Composants React
│   │   ├── GameSetup.tsx    # Écran de configuration
│   │   ├── PokemonCard.tsx  # Carte Pokémon avec sélection
│   │   └── GameResult.tsx   # Écran de résultats
│   ├── hooks/
│   │   └── usePokeGame.ts   # Logique du jeu
│   ├── types/
│   │   └── pokemon.ts       # Types TypeScript
│   ├── App.tsx              # Composant principal
│   ├── App.css              # Styles globaux
│   └── main.tsx             # Point d'entrée
├── public/                  # Assets statiques
└── package.json             # Dépendances
```

## 🎨 Personnalisation

### Modifier l'objectif par défaut
Dans `src/components/GameSetup.tsx`, ligne 10 :
```typescript
const [targetTotal, setTargetTotal] = useState(600) // Changez 600
```

### Ajouter des filtres personnalisés
Dans `src/types/pokemon.ts`, ajoutez vos propres régions ou critères dans `REGIONS` ou `FilterOptions`.

## 📊 Statistiques Pokémon

Les 6 statistiques disponibles :
- **HP** : Points de vie
- **Attaque** : Puissance des attaques physiques
- **Défense** : Résistance aux attaques physiques
- **Att. Spé** : Puissance des attaques spéciales
- **Déf. Spé** : Résistance aux attaques spéciales
- **Vitesse** : Ordre d'action en combat

## 🐛 Problèmes Connus

- Certains Pokémon rares peuvent échouer au chargement - le jeu réessaie automatiquement
- Les filtres spéciaux combinés peuvent donner un pool très restreint

## 🔮 Améliorations Futures

- [ ] Mode multijoueur compétitif
- [ ] Historique des parties avec statistiques
- [ ] Classement et achievements
- [ ] Modes de difficulté prédéfinis (Facile/Normal/Difficile/Expert)
- [ ] Indices optionnels (révéler une stat, éliminer la plus basse, etc.)
- [ ] Support des formes régionales (Alola, Galar, etc.)

## 📝 Licence

MIT

## 🙏 Crédits

- Données Pokémon : [PokéAPI](https://pokeapi.co/)
- Sprites : The Pokémon Company
