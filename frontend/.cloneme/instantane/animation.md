# Animations — LinkedAI (direction artistique Nexora)

La référence est une **image fixe** : aucune animation n'y est visible. Toutes
les animations ci-dessous sont donc **Approximé** : choisies pour aller avec le
style calme et premium de la maquette, et réglées une seule fois ici.

## Réglages globaux

| Variable | Valeur | Origine | Usage |
|---|---|---|---|
| `--duree-rapide` | `150ms` | Approximé | survols, appuis |
| `--duree-standard` | `250ms` | Approximé | menus, onglets, indicateur de nav |
| `--duree-lente` | `600ms` | Approximé | entrée des cartes, graphiques |
| `--courbe-standard` | `cubic-bezier(0.22, 1, 0.36, 1)` | Approximé | toutes les transitions |

Constantes JS équivalentes dans `src/lib/animations.js` :

| Constante | Valeur | Copie de |
|---|---|---|
| `DUREES.rapide` | 0.15 s | `--duree-rapide` |
| `DUREES.standard` | 0.25 s | `--duree-standard` |
| `DUREES.lente` | 0.6 s | `--duree-lente` |
| `DUREES.flottement` | 6 s | — (cycle de A-03) |
| `DECALAGES.cartes` | 0.06 s | — (cascade de A-02) |

- Défilement lissé : non.
- Bibliothèque : framer-motion 11 (exigée par les composants Lightswind).

## Inventaire

| ID | Élément | Pages | Déclencheur | Nature | Origine |
|---|---|---|---|---|---|
| A-01 | boutons, liens, items de nav, lignes de liste | toutes | survol, appui | transition CSS | Approximé |
| A-02 | cartes de page | toutes | arrivée sur la page | fondu + montée, en cascade | Approximé |
| A-03 | carte visuelle LinkedAI | P-01 | en continu | flottement vertical lent | Approximé |
| A-04 | chiffres clés | P-01 | entrée dans l'écran | compteur (Lightswind Count Up) | Approximé |
| A-05 | barre de progression en haut | toutes | appel IA ou scraper en cours | barre qui avance (Lightswind Top Loader) | Approximé |
| A-06 | item de nav actif | toutes | changement de page | fond qui glisse d'un item à l'autre | Approximé |
| A-07 | menus déroulants (recherche, notifications) | toutes | ouverture, fermeture | fondu + légère descente | Approximé |
| A-08 | histogramme et donut | P-01 | arrivée sur la page | barres qui montent, segments qui se tracent | Approximé |

## Fiches

### A-01 — Survols et appuis
- Propriétés : `background-color`, `color`, `box-shadow`, `transform: scale(0.98)` à l'appui.
- Durée / courbe : `--duree-rapide`, `--courbe-standard`.
- Mode réduit : couleurs gardées, pas d'échelle.
- Implémentation : classes `.btn-*`, `.nav-item`, `.ligne-liste` dans `src/index.css`.

### A-02 — Entrée des cartes
- Propriétés : `opacity` 0 → 1, `y` 12 px → 0.
- Durée / courbe : `DUREES.lente`, `COURBES.standard`, cascade `DECALAGES.cartes`.
- Réversible : non (une fois par arrivée sur la page).
- Mode réduit : apparition directe (`MotionConfig reducedMotion="user"`).
- Implémentation : `entreeConteneur` / `entreeCarte` (`src/lib/animations.js`), utilisés par `Page` et `Card`.

### A-03 — Flottement de la carte visuelle
- Propriétés : `y` 0 → −8 px → 0, `rotate` −8° → −6° → −8°.
- Durée : `DUREES.flottement`, boucle infinie, `easeInOut`.
- Mode réduit : carte immobile.
- Implémentation : `src/components/dashboard/CarteVisuelle.jsx`.

### A-04 — Compteurs
- Composant Lightswind `CountUp` (MIT), porté en JSX, couleurs passées aux tokens.
- Durée 1,2 s, `easeOut`, déclenché par `IntersectionObserver`.
- Mode réduit : valeur finale affichée directement.
- Implémentation : `src/components/lightswind/CountUp.jsx`.

### A-05 — Barre de progression
- Composant Lightswind `TopLoader` (MIT), porté en JSX, couleur `--couleur-accent`.
- Avance par petits pas tant qu'un appel est en cours, puis se remplit et disparaît.
- Mode réduit : la barre reste, sans lueur.
- Implémentation : `src/components/lightswind/TopLoader.jsx`, piloté par `useActiviteStore`.

### A-06 — Indicateur de nav
- Fond `--couleur-surface-douce` partagé (`layoutId`) qui glisse vers l'item actif.
- Durée / courbe : `DUREES.standard`, `COURBES.standard`.
- Mode réduit : saut direct.
- Implémentation : `src/components/layout/Sidebar.jsx`.

### A-07 — Menus déroulants
- Propriétés : `opacity`, `y` −6 px → 0, `scale` 0.98 → 1.
- Durée : `DUREES.standard` à l'ouverture, `DUREES.rapide` à la fermeture.
- Implémentation : `menuDeroulant` (`src/lib/animations.js`), utilisé par `RechercheGlobale` et `Notifications`.

### A-08 — Graphiques
- Histogramme : `scaleY` 0 → 1 depuis le bas, cascade de 0,05 s.
- Donut : `pathLength` 0 → valeur du segment.
- Durée / courbe : `DUREES.lente`, `COURBES.standard`.
- Implémentation : `src/components/charts/Histogramme.jsx`, `src/components/charts/Donut.jsx`.

## Mode animations réduites

- `prefers-reduced-motion: reduce` respecté globalement : `MotionConfig reducedMotion="user"`
  dans `main.jsx`, et `src/styles/animations.css` coupe les transitions CSS.
