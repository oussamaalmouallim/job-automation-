# AI Job Automation & LinkedIn Assistant SaaS

Plateforme SaaS d'automatisation IA pour generer des posts LinkedIn, scraper des profils, rechercher des offres et adapter des lettres de motivation.

**Stack**: React, Vite, Tailwind, Node.js, Express, n8n, Prisma, SQLite.

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
  -> /api/posts/generate
  -> Backend Express
  -> n8n webhook
  -> Prisma GeneratedPostLog
  -> reponse au frontend
```

Le frontend ne doit plus appeler n8n directement pour la generation de posts, sinon les logs Prisma ne seront pas enregistres.

## Variables d'environnement

Backend:

```env
DATABASE_URL="file:./dev.db"
N8N_POST_WEBHOOK="http://localhost:5678/webhook/generate-post"
```

Le backend lit aussi le `.env` a la racine du projet, utile si l'URL existe deja sous:

```env
VITE_N8N_POST_WEBHOOK="http://localhost:5678/webhook/generate-post"
```

## Phases

- **Phase 1**: MVP dashboard, generateur de posts, connexion scraper n8n, logs Prisma.
- **Phase 2**: Authentification et rattachement des logs a un utilisateur.
- **Phase 3**: Lettres de motivation, recherche d'offres, exports.
- **Phase 4**: Abonnements, analytics, paiements.

---

Developpe par **Oussama AL MOUALLIM EL KANOUNI**.
