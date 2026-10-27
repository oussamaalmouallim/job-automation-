# Architecture

## Vue d'ensemble

| Partie | Techno | Rôle | Port |
|---|---|---|---|
| Front | React 18, Vite 5, Tailwind 3, zustand, framer-motion | interface, données gardées dans le navigateur | 3000 |
| Backend | Node.js, Express 4, Prisma 6, SQLite | seul point d'entrée : IA, relais n8n, historique | 4000 |
| n8n | Docker `n8nio/n8n` | ressources, visuel IA, scraper | 5678 |
| IA | DeepSeek (`deepseek/deepseek-chat`) via OpenRouter | posts et visuels | — |
| Recherche | Google Custom Search | profils LinkedIn publics pour le scraper | — |

## Les trois parcours

### Générer un post

```text
PostGenerator.jsx → services/api.js generatePost()
  → POST /api/posts/generate            (backend/src/routes/posts.js)
      → OpenRouter, modèle deepseek      prompt construit côté serveur
      → GeneratedPostLog en base          historique serveur
  ← { post }
  → addPost() dans le store              historique navigateur (50 derniers)
```

### Ressources et visuel d'un post

```text
PostGenerator.jsx / VisualCardGenerator.jsx
  → POST /api/n8n/resource-suggestions | /api/n8n/generate-visual
      → backend/src/routes/n8n.js        relaie vers n8n /webhook/<nom>
          → workflow n8n                  docs + conseils | HTML du visuel (deepseek)
  ← réponse de n8n, renvoyée telle quelle
```

Le visuel est affiché dans un iframe isolé (`sandbox="allow-scripts"`, sans accès à la page). L'export PNG se fait dans l'iframe, qui renvoie l'image par `postMessage`.

### Scraper des profils

```text
Scraper.jsx → POST /api/n8n/scraper { query, location, maxPages }
  → n8n workflow linkedin-scraper-webhook
      → Google Custom Search, page par page (10 profils par page, 10 pages au plus)
  ← { profiles: [{ name, title, link, snippet, image }] }
  → addProfiles() dans le store
```

Si un webhook est réglé dans Paramètres (ou `VITE_N8N_SCRAPER_WEBHOOK`), le front l'appelle à la place du backend.

## API du backend

| Méthode | Route | Corps | Réponse |
|---|---|---|---|
| GET | `/api/health` | — | `{ status: 'ok', version }` |
| POST | `/api/posts/generate` | `{ type, description, tech, tone }` | `{ success, post, log }` · 400 si description vide ou > 2000 caractères · 502 si OpenRouter échoue |
| GET | `/api/posts/logs` | `?userId=` (optionnel) | `{ success, logs }` (50 derniers) |
| POST | `/api/n8n/:nom` | relayé tel quel | réponse de n8n · 404 si `nom` n'est pas autorisé |

Webhooks autorisés : `resource-suggestions`, `generate-visual`, `scraper`.

## Protections

- **Clés** : `OPENROUTER_API_KEY` dans `backend/.env` ; clés n8n dans `~/n8n.env`. Le build du front n'en contient aucune.
- **CORS** : seules les origines de `CORS_ORIGINS` peuvent appeler le backend depuis un navigateur.
- **Limite** : 20 appels par minute et par IP sur `/api/posts/generate` et `/api/n8n` (`backend/src/lib/rateLimit.js`, en mémoire). `trust proxy` est activé pour lire l'IP réelle derrière un tunnel.
- **Relais n8n** : liste blanche de 3 webhooks ; le reste de n8n n'est jamais exposé.

## Données

| Où | Quoi | Durée de vie |
|---|---|---|
| Navigateur, `localStorage` « linkedai-storage » | posts (50), profils (200), lettres (20), offres, paramètres | jusqu'à effacement du navigateur |
| SQLite `backend/prisma/dev.db`, table `GeneratedPostLog` | chaque post généré par le backend | permanente |
| `~/n8n-data` | workflows et comptes n8n | permanente |

## Front : organisation

- `src/pages/` : une page par route (`P-xx` dans `frontend/design.md`).
- `src/components/ui/` : briques réutilisables (Card, Button, Field, Badge, Tabs, EmptyState, Page, ListeActivite, PageAttente).
- `src/components/layout/` : cadre, sidebar, barre du haut, recherche globale, notifications.
- `src/components/lightswind/` : CountUp et TopLoader, portés depuis Lightswind UI (MIT).
- `src/lib/` : navigation, profil, options des posts, statistiques, export CSV, réglages d'animation.
- `src/styles/tokens.css` : toutes les couleurs, ombres, rayons et durées (miroir de `frontend/palette.md`).
