# AI Job Automation & LinkedIn Assistant SaaS

Plateforme SaaS d'automatisation IA pour generer des posts LinkedIn, scraper des profils, rechercher des offres et adapter des lettres de motivation.

**Stack**: React, Vite, Tailwind, framer-motion, lucide-react, OpenRouter, Node.js, Express, n8n, Prisma, SQLite.

---

## Structure

```text
saas-linkedin-ai/
├── frontend/          React + Vite + Tailwind
├── backend/           Node.js + Express + Prisma
├── backend/prisma/    Schema Prisma + migrations SQLite
├── n8n-workflows/     Exports JSON des workflows n8n
└── docs/              Documentation technique
```

## Interface

L'interface reprend la direction artistique de la maquette Nexora (Dribbble), adaptée à LinkedAI avec la méthode CloneMe (`.claude/skills/cloneme/`).

Trois fichiers pilotent l'apparence, à la racine de `frontend/` :

| Fichier | Rôle | Code piloté |
|---|---|---|
| `design.md` | pages, composants (`P-xx`, `C-xx`), responsive | `src/pages/`, `src/components/` |
| `palette.md` | couleurs, ombres, rayons, typographie | `src/styles/tokens.css` (valeur pour valeur) |
| `animation.md` | animations (`A-xx`), mode réduit | `src/lib/animations.js`, composants marqués |

Règle : aucune couleur ni durée en dur dans un composant. On passe par un token de `tokens.css`, exposé dans `tailwind.config.js`.

Vérifier que les fichiers et le code sont synchronisés :

```bash
node .claude/skills/cloneme/scripts/verifier-synchro.mjs frontend
```

Organisation de `frontend/src/` :

```text
components/ui/          briques réutilisables : Card, Button, Field, Badge, Tabs, EmptyState, Page…
components/layout/      cadre, sidebar, barre du haut, recherche globale, notifications
components/dashboard/   blocs du dashboard
components/charts/      donut et histogramme (SVG + framer-motion)
components/lightswind/  composants Lightswind (MIT) portés en JSX : CountUp, TopLoader
lib/                    navigation, profil, stats, export CSV, réglages d'animation
store/                  useAppStore (données persistées), useActiviteStore (appels en cours)
styles/                 tokens.css, animations.css
```

Rapport de la refonte : `frontend/RAPPORT-CLONAGE.md`.

## Architecture

```text
Navigateur (front React)
  -> Backend Express :4000          seul point d'entree public
       -> OpenRouter                 generation des posts (cle OPENROUTER_API_KEY sur le serveur)
       -> n8n :5678 /webhook/...     ressources, visuel IA, scraper (3 webhooks autorises)
       -> SQLite (Prisma)            logs des posts generes
```

Le front ne contient plus aucune cle. Il n'appelle que le backend (`/api`).

## Lancement en une commande

Prerequis : Docker lance, le conteneur `n8n` cree (section suivante), et `backend/.env` rempli.

```bash
cp backend/.env.example backend/.env   # une seule fois, puis renseigner OPENROUTER_API_KEY
npm install --prefix backend && npm install --prefix frontend   # une seule fois
npm run db:init --prefix backend                                 # une seule fois
npm run dev
```

`npm run dev` (a la racine) demarre n8n, le backend (http://localhost:4000) et le front (http://localhost:3000). Ctrl+C arrete le backend et le front ; n8n reste actif (`docker stop n8n` pour l'arreter).

## n8n

Creer le conteneur une fois, avec ses donnees gardees et ses cles lues dans un fichier hors du repo :

```bash
cp n8n-workflows/n8n.env.example ~/n8n.env   # puis renseigner les cles dedans
docker run -d --name n8n --restart unless-stopped -p 5678:5678 --env-file ~/n8n.env -v ~/n8n-data:/home/node/.n8n n8nio/n8n
```

Importer et activer les 3 workflows (menu Import from file dans n8n) : `linkedin-resource-suggestions-v4.json`, `linkedin-visual-generator.json`, `linkedin-scraper-webhook.json`.

Attention : `docker restart n8n` ne relit pas `~/n8n.env`. Apres un changement de cle, supprimer et recreer le conteneur (les donnees restent dans `~/n8n-data`).

## Prisma

Le projet utilise Prisma avec SQLite pour stocker les logs des posts generes.

Table principale:

```text
GeneratedPostLog
```

Champs importants:

```text
description
technologies
generatedContent
type
tone
model
userId
createdAt
```

Initialiser la base:

```bash
cd backend
npm run db:init
```

Ouvrir Prisma Studio:

```bash
cd backend
npx prisma studio
```

Voir les logs directement dans le terminal:

```bash
cd backend
npm run db:logs
```

## Flow de generation de post

```text
Front -> POST /api/posts/generate -> backend -> OpenRouter (deepseek) -> reponse
                                           \-> log enregistre dans SQLite (GeneratedPostLog)
```

## Variables d'environnement

Backend (`backend/.env`, voir `backend/.env.example`) :

| Variable | Role |
|---|---|
| `OPENROUTER_API_KEY` | cle OpenRouter, jamais envoyee au navigateur |
| `CORS_ORIGINS` | adresses de front autorisees a appeler le backend |
| `N8N_BASE_URL` | adresse de n8n (defaut `http://localhost:5678`) |
| `APP_URL` | adresse publique du front, envoyee a OpenRouter |
| `DATABASE_URL` | base SQLite |

Front (`frontend/.env`, optionnel) :

| Variable | Role |
|---|---|
| `VITE_API_URL` | adresse publique du backend, ex. `https://xxxx.trycloudflare.com/api`. Vide en local. |
| `VITE_BASE` | chemin de base : `/` pour Vercel ou un domaine propre, `/job-automation-/` par defaut (GitHub Pages) |

Protection du backend : les routes qui appellent l'IA sont limitees a 20 appels par minute et par IP, et seuls les webhooks `resource-suggestions`, `generate-visual` et `scraper` sont relayes vers n8n. La limite de depense de la cle OpenRouter reste la vraie protection : la fixer sur openrouter.ai.

## Demo avec un tunnel

Le backend est le seul service a exposer : n8n reste prive.

1. Lancer `npm run dev`.
2. Ouvrir un tunnel vers le backend, par exemple avec cloudflared (sans compte) :

   ```bash
   cloudflared tunnel --url http://localhost:4000
   ```

   L'adresse `https://xxxx.trycloudflare.com` s'affiche.
3. Autoriser le front dans `backend/.env` : ajouter son adresse a `CORS_ORIGINS` (ex. `https://mon-app.vercel.app`), puis relancer le backend.
4. Construire le front avec `VITE_API_URL=https://xxxx.trycloudflare.com/api`.

Vercel heberge le front (fichiers statiques), pas le tunnel. Projet Vercel : dossier racine `frontend`, variables `VITE_BASE=/` et `VITE_API_URL=<adresse du tunnel>/api`. Le fichier `frontend/vercel.json` gere les routes.

L'adresse d'un tunnel rapide change a chaque lancement : refaire les etapes 3 et 4 si tu le relances, ou utiliser un tunnel nomme.

## Deploiement GitHub Pages

Le projet est configure pour GitHub Pages avec Vite (`base: /job-automation-/`). Le workflow `.github/workflows/deploy-pages.yml` build `frontend` et publie `frontend/dist`.

Aucun secret n'est necessaire. Pour que l'app publiee atteigne un backend, ajouter une variable (pas un secret) :

```text
Repository Settings -> Secrets and variables -> Actions -> Variables -> New repository variable
Name: VITE_API_URL
Value: https://xxxx.trycloudflare.com/api
```

Puis activer GitHub Pages (`Settings -> Pages -> Source: GitHub Actions`) et pousser sur `main`. L'app sera publiee sur :

```text
https://oussamaalmouallim.github.io/job-automation-/
```

## Phases

- **Phase 1**: MVP dashboard, generateur de posts, connexion scraper n8n, logs Prisma.
- **Phase 2**: Authentification et rattachement des logs a un utilisateur.
- **Phase 3**: Lettres de motivation, recherche d'offres, exports.
- **Phase 4**: Abonnements, analytics, paiements.

---

Developpe par **Oussama AL MOUALLIM EL KANOUNI**.
