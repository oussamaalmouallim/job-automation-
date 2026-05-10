# Connexion du scraper n8n au frontend

## Situation actuelle

Ton scraper fonctionne avec un `chatTrigger` n8n.  
Les résultats sont exportés dans **Google Sheets**.

```
chatTrigger → Set Fields → Search Google → Extract Results → Wait → Add to Google → Pagination → loop
```

## Modification recommandée (30 min)

Pour que le frontend reçoive les profils directement en JSON, il faut :

### Étape 1 — Remplacer le trigger

1. Dans n8n, ouvre le workflow `linkedin-scraper`
2. Supprime le nœud **"When chat message received"** (chatTrigger)
3. Ajoute un nœud **"Webhook"** :
   - HTTP Method : `POST`
   - Path : `/scraper`
   - Respond : `Using 'Respond to Webhook' Node`
4. Connecte-le à **"Set Fields"**

### Étape 2 — Ajouter le retour JSON

Après le nœud **"Pagination Check"** (branche False = fin du loop) :

1. Ajoute un nœud **"Respond to Webhook"**
2. Configure :
   - Response Body : `{{ $('Extract Results').all() }}`
   - Status Code : `200`

### Étape 3 — Récupérer l'URL

1. Active le workflow
2. Copie l'URL du webhook n8n (format : `https://xxx.app.n8n.cloud/webhook/scraper`)
3. Colle-la dans `frontend/.env` :

```env
VITE_N8N_SCRAPER_WEBHOOK=https://xxx.app.n8n.cloud/webhook/scraper
```

## Structure des données retournées

Le scraper retourne des profils avec cette structure :

```json
[
  {
    "name":       "Youssef Benali",
    "title":      "Ingénieur Cloud AWS · Casablanca",
    "link":       "https://www.linkedin.com/in/youssef-benali",
    "snippet":    "Ingénieur cloud avec 5 ans d'expérience...",
    "image":      "https://...",
    "startIndex": 11
  }
]
```

## Limites Google Custom Search API (gratuit)

| Limite          | Valeur  |
|----------------|---------|
| Requêtes/jour  | 100     |
| Résultats/req  | 10      |
| Total/jour     | 1 000   |
| Pages max      | 10 (index 1-100) |

## Test rapide (sans modifier n8n)

Tu peux tester la connexion avec curl :

```bash
curl -X POST https://TON_INSTANCE.app.n8n.cloud/webhook/scraper \
  -H "Content-Type: application/json" \
  -d '{"message": "scrape linkedin cloud engineer maroc maxPages:1"}'
```
