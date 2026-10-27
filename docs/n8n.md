# n8n

n8n tourne dans Docker, sur le port 5678. Seul le backend l'appelle.

## Installer

1. Copier le modèle de clés hors du dépôt et le remplir :

   ```bash
   cp n8n-workflows/n8n.env.example ~/n8n.env
   open -e ~/n8n.env
   ```

   | Variable | Sert à |
   |---|---|
   | `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` | laisser les workflows lire les variables ci-dessous |
   | `OPENROUTER_API_KEY` | visuel IA (deepseek) |
   | `GOOGLE_API_KEY` | scraper — clé Google Cloud, restreinte à « Custom Search API » |
   | `GOOGLE_CX` | scraper — identifiant du moteur Programmable Search |

2. Créer le conteneur :

   ```bash
   npm run n8n:reload
   ```

   Il est nommé `n8n`, redémarre avec Docker, et garde ses données dans `~/n8n-data`.

3. Ouvrir http://localhost:5678, créer le compte propriétaire.

4. Importer les 3 workflows (menu **⋯ → Import from file**) depuis `n8n-workflows/`, puis les activer (bouton **Active**) :

   | Fichier | Webhook | Ce qu'il fait |
   |---|---|---|
   | `linkedin-resource-suggestions.json` | `resource-suggestions` | choisit des liens de doc et des conseils selon le post et les technologies. Aucun appel externe. |
   | `linkedin-visual-generator.json` | `generate-visual` | demande à deepseek un visuel HTML animé (architecture, conseils, avant/après, pipeline) |
   | `linkedin-scraper-webhook.json` | `scraper` | interroge Google Custom Search `<requête> <lieu> site:linkedin.com/in`, page par page, et renvoie `{ profiles }` |

   En ligne de commande, sans passer par l'interface :

   ```bash
   docker cp n8n-workflows/. n8n:/tmp/wf
   docker exec n8n n8n import:workflow --separate --input=/tmp/wf
   docker exec n8n n8n list:workflow
   docker exec n8n n8n publish:workflow --id=<id>   # pour chaque workflow, puis :
   docker restart n8n
   ```

## Changer une clé

Modifier `~/n8n.env`, puis :

```bash
npm run n8n:reload
```

`docker restart n8n` ne suffit pas : les variables sont lues à la création du conteneur.

## Tester

Par le backend (comme le fait l'app) :

```bash
curl -s -X POST http://localhost:4000/api/n8n/resource-suggestions -H "Content-Type: application/json" -d '{"post":"Projet n8n et React","tech":"n8n, React","type":"Projet technique"}'
```

```bash
curl -s -X POST http://localhost:4000/api/n8n/scraper -H "Content-Type: application/json" -d '{"query":"ingenieur cloud","location":"maroc","maxPages":1}'
```

## Quotas

- Google Custom Search : 100 requêtes gratuites par jour, soit 100 pages de 10 profils.
- OpenRouter : un visuel coûte une fraction de centime avec deepseek ; la limite de dépense se règle sur openrouter.ai.
