# PLAN — AI Job Automation & LinkedIn Assistant SaaS

> **Auteur** : Oussama AL MOUALLIM EL KANOUNI  
> **Titre** : Ingénieur en Solutions Cloud et Automatisation IA  
> **Stack** : React · n8n · OpenRouter · Supabase · Vercel

---

## Vue d'ensemble

Plateforme SaaS d'automatisation IA combinant :
- Génération de posts LinkedIn
- Recherche d'offres d'emploi intelligente
- Adaptation automatique de lettres de motivation
- Intégration du scraper LinkedIn n8n (déjà fonctionnel)

---

## Architecture globale

```
Frontend React (Vite + Tailwind)
        ↓
Webhook / API n8n
        ↓
OpenRouter (LLMs : DeepSeek, Gemini, Llama, Claude)
        ↓
Supabase (DB + Auth)
        ↓
Vercel / Railway (Hosting)
```

---

## Phase 1 — MVP fonctionnel

> **Objectif** : avoir un dashboard utilisable localement avec le générateur de posts et la connexion n8n.

### Étape 1.1 — Init projet React

- [ ] Créer le projet : `npm create vite@latest saas-app -- --template react`
- [ ] Installer Tailwind CSS
- [ ] Installer les dépendances : `react-router-dom`, `axios`, `zustand` (state), `react-hot-toast`
- [ ] Mettre en place la structure de dossiers :

```
src/
  pages/
    Dashboard.jsx
    PostGenerator.jsx
    JobsFinder.jsx
    MotivationLetter.jsx
    Settings.jsx
  components/
    Layout.jsx
    Sidebar.jsx
    Header.jsx
  hooks/
  services/
    api.js       ← appels n8n et OpenRouter
  store/
    useAppStore.js
```

### Étape 1.2 — Layout & navigation

- [ ] Sidebar avec icônes : Dashboard · Posts · Offres · Lettre · Settings
- [ ] Header avec titre de page + avatar utilisateur
- [ ] Routing React Router entre les pages

### Étape 1.3 — Générateur de posts LinkedIn

- [ ] Formulaire : type de post · description · technologies · ton · modèle IA
- [ ] Appel webhook n8n : `POST /webhook/generate-post`
- [ ] Affichage du post généré + compteur de caractères
- [ ] Boutons : Copier · Regénérer · Ouvrir LinkedIn
- [ ] Sauvegarde locale dans le state (Zustand)

**Payload envoyé à n8n :**
```json
{
  "type": "project | tip | storytelling",
  "description": "...",
  "tech": "n8n, AWS, React",
  "tone": "professional | human | viral",
  "model": "deepseek | gemini | llama | claude"
}
```

### Étape 1.4 — Connexion scraper LinkedIn n8n ✅ (déjà fonctionnel)

- [ ] Identifier l'URL du webhook n8n existant du scraper
- [ ] Créer dans `services/api.js` la fonction `triggerScraper(params)`
- [ ] Créer la page `Scraper.jsx` avec formulaire de déclenchement
- [ ] Afficher les résultats (profils) retournés par n8n dans un tableau
- [ ] Ajouter filtres : poste · entreprise · localisation

**Appel à connecter :**
```js
// services/api.js
export const triggerScraper = async (params) => {
  const res = await axios.post(N8N_SCRAPER_WEBHOOK_URL, params);
  return res.data; // profils extraits
};
```

### Étape 1.5 — Historique simple

- [ ] Stocker les posts générés dans `localStorage` (ou Supabase plus tard)
- [ ] Page historique : liste des posts avec date + type + copie rapide

---

## Phase 2 — Features IA

> **Objectif** : ajouter la génération de lettres de motivation et les templates dynamiques.

### Étape 2.1 — Adaptation de lettre de motivation

- [ ] Upload PDF ou DOCX (via input file)
- [ ] Extraction du texte côté client (pdf.js ou envoi à n8n)
- [ ] Champ "Coller l'offre d'emploi"
- [ ] Appel n8n : `POST /webhook/adapt-letter`
- [ ] Affichage de la lettre adaptée
- [ ] Export PDF (jsPDF) ou DOCX (docx.js)

**Workflow n8n à créer :**
```
Webhook reçoit lettre + offre
        ↓
Extraction texte (si PDF)
        ↓
Prompt IA dynamique via OpenRouter
        ↓
Retour lettre adaptée en JSON
```

### Étape 2.2 — Templates dynamiques

- [ ] Créer 5 templates : Minimal · Corporate · Startup · Technique · ATS Friendly
- [ ] Interface de sélection avec aperçu
- [ ] Injection du template dans le prompt IA

### Étape 2.3 — Choix du modèle IA

- [ ] Selector dans l'UI : DeepSeek · Gemini · Llama · Claude
- [ ] Passer le modèle choisi dans chaque appel n8n
- [ ] n8n route vers OpenRouter avec le bon modèle

### Étape 2.4 — Score IA du post

- [ ] Après génération, appel secondaire à OpenRouter
- [ ] Retourner un score JSON : `{ engagement, lisibilité, viralité, cta }`
- [ ] Afficher les scores sous forme de barres de progression

---

## Phase 3 — Recherche d'offres & scraping avancé

> **Objectif** : centraliser les offres de plusieurs sources et enrichir le scraper LinkedIn.

### Étape 3.1 — Recherche d'offres intelligente

- [ ] Intégrer les APIs publiques disponibles :
  - Indeed (via RapidAPI)
  - RemoteOK (API gratuite)
  - WelcomeToTheJungle (scraping léger)
- [ ] Workflow n8n : `POST /webhook/search-jobs`
- [ ] Filtres : métier · localisation · remote · stack · date
- [ ] Système de favoris (Supabase)
- [ ] Historique de recherches

### Étape 3.2 — Connexion enrichie du scraper n8n

- [ ] Ajouter dans l'UI le déclenchement du scraper avec paramètres avancés :
  - Mots-clés · secteur · localisation · niveau d'expérience
- [ ] Stocker les profils scrapés dans Supabase (`scraped_profiles`)
- [ ] Visualiser les profils dans une table avec export CSV

### Étape 3.3 — Export

- [ ] Export posts : TXT · Markdown · PDF
- [ ] Export lettres : PDF · DOCX
- [ ] Export profils scrapés : CSV · Excel

---

## Phase 4 — SaaS réel

> **Objectif** : monétiser la plateforme avec auth, abonnements et analytics.

### Étape 4.1 — Authentification

- [ ] Supabase Auth : email/password + Google OAuth
- [ ] Page login / register / reset password
- [ ] Protection des routes React (PrivateRoute)

### Étape 4.2 — Base de données Supabase

Tables à créer :

| Table | Colonnes principales |
|---|---|
| `users` | id, email, plan, created_at |
| `generated_posts` | id, user_id, type, content, model, created_at |
| `motivation_letters` | id, user_id, offer, result, template, created_at |
| `job_searches` | id, user_id, query, results, created_at |
| `scraped_profiles` | id, user_id, name, company, skills, url, created_at |
| `ai_usage_logs` | id, user_id, feature, model, tokens, created_at |

### Étape 4.3 — Plans & limites

- [ ] Gratuit : 5 générations/jour (vérification côté Supabase)
- [ ] Pro : illimité + templates premium + multi-modèles
- [ ] Team : multi-users + analytics + scraping

### Étape 4.4 — Paiements

- [ ] Intégrer Stripe (ou Gumroad pour démarrer vite)
- [ ] Webhook Stripe → mise à jour du plan dans Supabase
- [ ] Page pricing avec tableau comparatif

### Étape 4.5 — Analytics dashboard

- [ ] Nombre de posts générés (par jour / semaine)
- [ ] Modèles IA les plus utilisés
- [ ] Taux de conversion gratuit → Pro
- [ ] Graphiques recharts dans le dashboard

---

## Variables d'environnement

```env
VITE_N8N_BASE_URL=https://ton-instance-n8n.com
VITE_N8N_SCRAPER_WEBHOOK=https://ton-instance-n8n.com/webhook/scraper
VITE_N8N_POST_WEBHOOK=https://ton-instance-n8n.com/webhook/generate-post
VITE_N8N_LETTER_WEBHOOK=https://ton-instance-n8n.com/webhook/adapt-letter
VITE_N8N_JOBS_WEBHOOK=https://ton-instance-n8n.com/webhook/search-jobs
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

---

## Prochaine action immédiate

```bash
# 1. Créer le projet
npm create vite@latest saas-linkedin-ai -- --template react
cd saas-linkedin-ai

# 2. Installer les dépendances
npm install tailwindcss @tailwindcss/vite react-router-dom axios zustand react-hot-toast

# 3. Lancer
npm run dev
```

Ensuite : connecter le webhook du scraper n8n existant → tester l'appel → afficher les résultats.

---

*Plan généré le 10/05/2026 — version 1.0*
