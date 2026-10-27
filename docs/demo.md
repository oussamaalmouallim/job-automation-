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
