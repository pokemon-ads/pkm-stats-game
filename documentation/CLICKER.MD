# Cahier des charges — Cookie Clicker “sauce Pokémon” (Web React + Vite)

> Projet WIP : jeu idle/clicker où l’on clique pour générer de l’Énergie et où des Pokémon (helpers) augmentent la production.

---

## 1) Vision & concept

### Pitch
Un clicker inspiré de Cookie Clicker, avec un thème “Pokémon helpers” :  
- **Clic** → génère de l’**Énergie (E)**  
- **Pokémon** → apportent de la **production automatique (E/s)** et des **bonus**  
- **Upgrades** → améliorent clic, production, coûts, etc.  
- **Paliers** → déverrouillent progressivement le contenu

### Boucle de gameplay (core loop)
1. Cliquer → gagner E
2. Dépenser E → acheter upgrades / monter les Pokémon
3. Augmenter E/s et E/clic → accélérer la progression
4. Déverrouiller paliers → plus de contenu
5. Répéter avec des chiffres plus grands

---

## 2) Ressources & systèmes

### Ressource principale (V1)
- **Énergie (E)** : générée au clic + passivement (E/s)

### Ressources secondaires (futures)
- **Fragments / Bonbons** : level up / évolution Pokémon
- **Jetons** : quêtes / boutique spéciale
- **Énergies élémentaires** (Feu/Eau/Plante…) : synergies par type (V2+)

---

## 3) Périmètre V1 (MVP) — “jouable, stable, sauvegarde fiable”

### Objectif V1
Une version simple mais addictive, qui :
- se comprend en < 5 min
- propose une progression sur ~30–90 min
- sauvegarde correctement la progression
- donne une sensation de montée en puissance

### Inclus (MUST)
#### A) Gameplay clicker
- Clic = +X Énergie
- Affichage permanent :
  - Énergie totale
  - Énergie par seconde (**E/s**)
  - Énergie par clic (**E/clic**)
- Feedback visuel minimal (pop number / petit shake / glow)

#### B) Boutique d’upgrades
- Upgrades achetables avec E :
  - +E/clic (plat ou %)
  - +% production globale
  - +E/s (générateurs ou bonus passifs)
- Coûts croissants (progression)
- Cartes avec :
  - coût
  - gain (ΔE/s, ΔE/clic)
  - bouton désactivé si non achetable

#### C) Pokémon helpers (cœur du thème)
- 6 à 12 Pokémon en V1
- Recommandation V1 : **1 Pokémon = niveaux** (au lieu de plusieurs exemplaires)
- Chaque Pokémon a :
  - coût de déblocage
  - niveau
  - bonus principal (E/s ou multiplicateur)
  - éventuellement un bonus simple (ex : +% clic)

Exemples de rôles (indicatifs) :
- E/s stable
- +% production globale
- +E/clic
- petit “burst” chance (proc léger)

#### D) Paliers / déblocages
- 3 à 5 paliers maximum en V1
- Déblocage via :
  - Énergie totale dépensée, et/ou
  - seuils de production (E/s)

#### E) UI/UX basique mais solide
- Écran principal clair :
  - bouton central Énergie
  - stats en haut
  - panneaux Boutique / Pokémon (onglets ou colonnes)
- Notifications de déblocage (toast)
- Responsive mobile minimal

#### F) Sauvegarde locale
- LocalStorage (auto-save + export/import)
- Import valide + migration versionnée
- Offline progress recommandé (capé)

### Exclu (V1)
- Combat / expéditions
- Prestige / Rebirth
- Pokédex massif
- Online / leaderboard global
- Monétisation

### Critères d’acceptation V1 (DoD)
- Un nouveau joueur progresse sans explications externes
- Rechargement page = progression identique
- Export/import fonctionne + validation
- Offline progress fonctionne (avec limite)
- Aucune valeur NaN/Infinity, pas de softlock

---

## 4) Stack & architecture (React + Vite)

### Vues / composants (V1)
- **GameView** : écran principal (stats + bouton + panneaux)
- **ShopPanel** : upgrades / générateurs
- **PokemonPanel** : liste + niveaux + bonus
- **SettingsModal** :
  - export / import
  - reset save
  - options (son, reduced motion)

Composants utiles :
- `BigEnergyButton`
- `TopStatsBar`
- `UpgradeCard`
- `PokemonCard`
- `ToastUnlock`
- `NumberFormat` (K/M/B)

### Moteur de jeu (game loop)
- Tick régulier (ex: 100–250ms)
- Ajout de production :  
  `energy += energyPerSecond * deltaSeconds`
- `deltaSeconds` calculé via `Date.now()` pour éviter les problèmes FPS.

### Calculs (simples en V1)
- `energyPerClick = baseClick * globalMultiplier * clickMultiplier`
- `energyPerSecond = (sumGenerators + sumPokemonEPS) * globalMultiplier`

> Conseil V1 : peu de multiplicateurs pour éviter les bugs d’empilement.

---

## 5) Modèle de données (Save State)

### Save minimal V1 (TypeScript)
```ts
type SaveV1 = {
  version: 1
  savedAt: number // Date.now()

  energy: number

  totalEnergyEarned: number
  totalEnergySpent: number
  totalClicks: number

  upgradesPurchased: Record<string, number> // id -> count (souvent 0/1)
  generatorsOwned: Record<string, number>   // id -> qty (si utilisés)
  pokemons: Record<string, { unlocked: boolean; level: number }>

  settings: {
    sound: boolean
    reducedMotion: boolean
  }
}

Catalogue statique (non sauvegardé)

Définir séparément :

catalogUpgrades[]

catalogPokemons[]

catalogGenerators[] (optionnel)

Le save ne stocke que “ce que le joueur possède”.

Permet d’ajuster l’équilibrage sans casser la save.

6) LocalStorage : stratégie de sauvegarde
Clé de stockage

poke-clicker-save

Auto-save

Toutes les 10–15s

sur visibilitychange (onglet caché / fermeture)

Export / Import

Export : JSON (ou base64(JSON))

Import :

parse + validation minimale

migration vers version courante

fallback si corrompu → createNewSave()

7) Offline progress (recommandé en V1)

À la reprise :

offlineSeconds = (Date.now() - savedAt) / 1000

offlineSeconds capé (ex : max 8 heures)

Gain :

energy += energyPerSecond * offlineSeconds

Afficher un message :

“Gains hors-ligne : +X Énergie (Y minutes)”

8) Versioning & migrations
Règles

save.version obligatoire

migrate(save) convertit vers la version actuelle

Toujours backward-compatible via migrations (V1 → V2 → V3…)

Exemple d’évolution

V2 ajoute prestige

V3 ajoute pokedex

9) Économie & équilibrage (guidelines V1)
Objectif de courbe

0–1 min : upgrades rapides (dopamine)

5–10 min : premiers Pokémon et E/s visible

30–90 min : atteindre dernier palier V1 + écran “Fin V1 / teaser”

Coûts (recommandations)

Upgrades uniques : coûts fixes par palier

Pokémon niveaux : coût * 1.25 à 1.35 par niveau

Générateurs : coût * 1.15 à 1.25 (si utilisés)

UX achat

Afficher ΔE/s ou ΔE/clic

Afficher “temps pour atteindre le coût” (optionnel V1.1)

10) Contenu V1 (proposition)
Pokémon

6 à 12 Pokémon

Chaque Pokémon :

déblocage (E)

niveaux

bonus principal + bonus simple éventuel

Upgrades

10 à 20 upgrades

Mix : clic, production globale, E/s plat, réduction de coûts (léger)

Paliers

3 à 5 paliers max

Chaque palier déverrouille : 1–3 upgrades + 1–2 Pokémon

11) Roadmap futures (après V1)
V1.1 — Qualité & rétention

Achievements (succès)

Stats avancées (temps joué, meilleur E/s, E totale)

Quêtes journalières locales

UI polish (tooltips, “next goal”, mini-tutoriel)

V1.2 — Collection & variété

Pokédex (collection)

Pokémon rares / raretés

Synergies par types (Feu/Eau/Plante)

Évolutions (level + ressource)

V2 — Long terme

Prestige / Rebirth + ressource méta

Arbre de talents méta-progression

Événements (boost week-end)

Expéditions (idle timers) + rewards

V3 — Social / Online (optionnel)

Cloud save (compte)

Leaderboards

Saisons
