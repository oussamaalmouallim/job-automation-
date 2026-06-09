# AI Job Automation & LinkedIn Assistant SaaS

Plateforme SaaS d'automatisation IA pour generer des posts LinkedIn, scraper des profils, rechercher des offres et adapter des lettres de motivation.

**Stack**: React, Vite, Tailwind, OpenRouter, Node.js, Express, n8n, Prisma, SQLite.

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

## Lancement

### Backend

```bash
cd backend
npm install
npm run db:init
npm run dev
```

Le backend tourne sur:

```text
http://localhost:4000
```

### Frontend

Dans un deuxieme terminal:

```bash
cd frontend
npm install
npm run dev
```

Le frontend tourne sur:

```text
http://localhost:3000
```

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
Frontend
  -> OpenRouter Chat Completions API
  -> reponse au frontend
```

Le frontend n'appelle plus le webhook n8n pour la generation de posts LinkedIn.

## Variables d'environnement

Frontend:

```env
VITE_OPENROUTER_API_KEY="REMPLACE_PAR_TA_VRAIE_CLE"
```

Backend local:

```env
DATABASE_URL="file:./dev.db"
```

## Deploiement GitHub Pages

Le projet est configure pour GitHub Pages avec Vite:

```text
base: /job-automation-/
```

Le workflow `.github/workflows/deploy-pages.yml` build `frontend` et publie `frontend/dist`.

Avant de deployer, ajouter ce secret dans GitHub:

```text
Repository Settings -> Secrets and variables -> Actions -> New repository secret
Name: VITE_OPENROUTER_API_KEY
Value: ta cle OpenRouter
```

Puis activer GitHub Pages:

```text
Repository Settings -> Pages -> Source: GitHub Actions
```

Ensuite, pousser sur `main`. L'app sera publiee sur:

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
