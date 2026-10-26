# Rapport de refonte — LinkedAI × Nexora

Refonte de l'interface faite le 2026-10-26, avec la méthode CloneMe
(`.claude/skills/cloneme/`) adaptée à une source en image.

## 1. Ce qui a été fait

- La direction artistique de Nexora est reprise : couleurs relevées sur l'image, sidebar claire, accueil en grand, carte de chiffre clé, rangée d'actions, donut, histogramme, listes.
- Les 6 routes existantes sont gardées et refaites. Une page 404 est ajoutée.
- Toutes les fonctions existantes sont gardées : génération OpenRouter, ressources n8n, visuel IA et export PNG, historique, scraper, filtre, export CSV, vidage, paramètres.
- Le dashboard n'affiche que des données réelles du store. Le faux « 3/5 générations » est retiré.
- Deux composants Lightswind (MIT) sont portés en JSX : `CountUp` (compteurs) et `TopLoader` (barre de progression pendant les appels IA et n8n).
- Tous les tokens sont dans `src/styles/tokens.css`. Aucune couleur n'est écrite en dur dans les composants (contrôlé par `verifier-synchro.mjs`).

## 2. Pages

| ID | Route | Statut |
|---|---|---|
| P-01 | `/dashboard` | refait sur la maquette, données réelles |
| P-02 | `/posts` | refait, logique inchangée |
| P-03 | `/scraper` | refait, logique inchangée |
| P-04 | `/lettre` | page d'attente (Phase 2) |
| P-05 | `/offres` | page d'attente (Phase 3) |
| P-06 | `/settings` | refait, logique inchangée |
| P-99 | `*` | nouveau |

## 3. Ajouts strictement liés à la nouvelle interface

- **Recherche globale** (barre du haut) : pages, posts de l'historique, profils. Raccourci ⌘K / Ctrl+K.
- **Cloche** : activité récente réelle. Le point rouge apparaît quand un post est plus récent que la dernière ouverture du menu.
- **Ouvrir un post depuis le dashboard, la recherche ou la cloche** : la page Posts charge le post demandé (même effet que « Charger » dans l'historique).
- **Export CSV depuis le dashboard** : même fonction que sur la page Scraper, déplacée dans `src/lib/exportCsv.js`.

## 4. Tests faits

| Test | Résultat |
|---|---|
| `npm run build` | passe |
| `verifier-synchro.mjs` | 52 tokens, 40 IDs, 5 constantes : aucun écart |
| Rendu 1440 · 1024 · 768 · 375 (captures) | conforme, aucun défilement horizontal |
| Dashboard vide et rempli (données de test injectées dans le navigateur, puis retirées) | conforme |
| Charger un post depuis l'historique | marche |
| Recherche « test » + Entrée → post chargé | marche |
| Cloche : menu, point rouge qui disparaît à l'ouverture | marche |
| Filtre des profils | marche |
| Lancer le scraper sans n8n | toast « Erreur n8n 500 », barre de progression, pas de plantage |
| Console | seule erreur : le 500 attendu du scraper sans n8n |

## 5. Pas testé ici

- La génération réelle d'un post : il faut une clé OpenRouter dans `frontend/.env`.
- Les ressources, le visuel IA et le scraper avec un vrai n8n : aucun n8n ne tourne en local.
- L'export PNG du visuel : il était déjà probablement cassé avant la refonte (`sandbox="allow-scripts"` sans `allow-same-origin` rend `contentDocument` nul). Comportement non modifié.
- Les animations en direct : le panneau de navigateur caché ralentit `requestAnimationFrame`. À regarder dans un vrai navigateur.

## 6. Limites et écarts assumés

- La source est une image : pas de survol, d'animation ni de version mobile à relever. Ces points sont « Approximé » dans les fichiers de référence.
- La police exacte est inconnue : Inter (Déduit).
- Le cadre arrondi sur fond taupe de la maquette est retiré (demande du 2026-10-26) : l'app occupe toute la fenêtre, sur `--couleur-app`.
- La photo de satin et la photo « Dubai Trip » ne sont pas reprises (droits). Le satin est remplacé par un dégradé.
- La comparaison automatique par empreintes de CloneMe ne s'applique pas (pas de page source).
- Paramètres propose encore llama/claude, alors que le générateur propose deepseek/gemini/grok. `defaultModel`, `defaultTone` et `n8nBaseUrl` restent sauvegardés sans être utilisés. C'est le comportement d'avant : à régler dans une prochaine étape fonctionnelle.

## 7. Droits

- Nexora : maquette de Hira Riaz pour Upnow Studio. Seule la direction artistique est reprise. Aucun texte, logo, image ni donnée n'est copié dans le projet.
- Lightswind : licence MIT (paquet npm `lightswind` 3.2.5). L'origine est notée en tête de chaque composant porté.

## 8. Fichiers de référence

- `frontend/design.md` — pages, composants, responsive, correspondance maquette → app
- `frontend/palette.md` — tous les tokens et leur origine
- `frontend/animation.md` — les 8 animations et le mode réduit
- `frontend/.cloneme/` — inventaire, ressources, instantané des trois fichiers
