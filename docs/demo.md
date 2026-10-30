# Préparer la démo

Le front est un site statique ; le backend tourne sur ton Mac. Pour une démo en ligne, il faut :
un **tunnel** vers le backend, et le **front hébergé** (Vercel ou GitHub Pages) qui pointe vers ce tunnel.
n8n n'a pas besoin de tunnel : le backend le relaie.

## 1. Lancer tout en local

```bash
npm run dev
```

Vérifier : http://localhost:4000/api/health répond `{"status":"ok"}`.

## 2. Ouvrir le tunnel vers le backend

Avec cloudflared (gratuit, sans compte) :

```bash
brew install cloudflared
```

```bash
cloudflared tunnel --url http://localhost:4000
```

Noter l'adresse affichée, par exemple `https://xxxx.trycloudflare.com`. Elle change à chaque lancement : pour une adresse fixe, utiliser un tunnel nommé (compte Cloudflare).

## 3. Héberger le front

### Option A — Vercel

1. Nouveau projet depuis le dépôt GitHub, **Root Directory** : `frontend`.
2. Variables d'environnement :
   - `VITE_BASE` = `/`
   - `VITE_API_URL` = `https://xxxx.trycloudflare.com/api`
3. Déployer. `frontend/vercel.json` renvoie toutes les routes vers `index.html`.

### Option B — GitHub Pages

1. `Settings → Secrets and variables → Actions → Variables` : `VITE_API_URL` = `https://xxxx.trycloudflare.com/api`.
2. `Settings → Pages → Source : GitHub Actions`.
3. Pousser sur `main` : le workflow `.github/workflows/deploy-pages.yml` publie le site.

## Connexion en démo : front et backend sur le même site

Depuis le lot L0.4, l'app demande une connexion, et la session passe par un cookie `SameSite=Lax`. Si le front (Vercel) et le backend (tunnel) sont sur **deux sites différents**, le navigateur n'envoie pas ce cookie : on reste bloqué sur la page de connexion.

Solution : faire passer `/api` par Vercel, pour que le navigateur ne voie qu'un seul site. Dans `frontend/vercel.json`, ajouter cette règle **avant** celle qui renvoie vers `index.html`, avec l'adresse du tunnel :

```json
{ "source": "/api/:chemin*", "destination": "https://xxxx.trycloudflare.com/api/:chemin*" }
```

Puis **ne pas** régler `VITE_API_URL` (le front appelle alors `/api`, servi par Vercel). Côté backend : `CORS_ORIGINS` et `BETTER_AUTH_URL` avec l'adresse Vercel.

Non testé en conditions réelles : à vérifier lors de la prochaine démo.

## 4. Autoriser le front dans le backend

Dans `backend/.env`, ajouter l'adresse du front à `CORS_ORIGINS` :

```env
CORS_ORIGINS=http://localhost:3000,https://mon-app.vercel.app
APP_URL=https://mon-app.vercel.app
```

Relancer le backend (Ctrl+C puis `npm run dev`).

## 5. Répéter

Depuis l'adresse publique, dans cet ordre :

- [ ] Dashboard : il s'affiche, sans erreur dans la console.
- [ ] Générateur : générer un post.
- [ ] « Trouver des ressources » : liens et conseils.
- [ ] « Visuel IA » : générer, puis exporter en PNG.
- [ ] Scraper : 1 page, puis filtre et export CSV.
- [ ] Dashboard : les chiffres et graphiques reflètent ce qui vient d'être fait.
- [ ] Mobile : ouvrir l'adresse sur un téléphone.

Astuce : faire cette répétition la veille. Les posts et profils restent dans le navigateur et remplissent le dashboard pour la démo, avec de vraies données.

## En cas de problème

| Symptôme | Cause probable | Correction |
|---|---|---|
| « Backend injoignable » | tunnel fermé ou `VITE_API_URL` faux | relancer le tunnel, mettre à jour `VITE_API_URL`, redéployer |
| Erreur CORS dans la console | adresse du front absente de `CORS_ORIGINS` | l'ajouter, relancer le backend |
| « Trop de requêtes » | limite de 20 appels IA par minute | attendre une minute |
| Ressources ou visuel en erreur 500 | n8n arrêté ou workflow inactif | `docker start n8n`, vérifier les workflows actifs |
| Scraper vide | quota Google du jour épuisé | attendre le lendemain ou réduire le nombre de pages |
