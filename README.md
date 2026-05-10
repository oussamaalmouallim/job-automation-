# AI Job Automation & LinkedIn Assistant SaaS

> Plateforme SaaS d'automatisation IA : génération de posts LinkedIn, recherche d'offres, adaptation de lettres de motivation, scraping de profils.

**Stack** : React · Node.js · n8n · OpenRouter · Supabase · Vercel

---

## Structure du projet

```
saas-linkedin-ai/
├── frontend/          ← React + Vite + Tailwind
├── backend/           ← Node.js + Express (proxy n8n + Supabase)
├── n8n-workflows/     ← Exports JSON des workflows n8n
└── docs/              ← Documentation technique
```

## Lancement rapide

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npm run dev
```

## Variables d'environnement

Voir `frontend/.env.example` et `backend/.env.example`

## Phases de développement

- **Phase 1** — MVP : dashboard + générateur de posts + connexion scraper n8n
- **Phase 2** — Features IA : lettres de motivation + templates + multi-modèles
- **Phase 3** — Offres d'emploi + scraping avancé + exports
- **Phase 4** — Auth + abonnements + analytics + paiements

---

Développé par **Oussama AL MOUALLIM EL KANOUNI**  
Ingénieur en Solutions Cloud et Automatisation IA
