#!/usr/bin/env bash
# Recrée le conteneur n8n pour qu'il relise ~/n8n.env (docker restart ne le relit pas).
# Les workflows et comptes restent : ils sont dans ~/n8n-data.
set -eu

if [ ! -f "$HOME/n8n.env" ]; then
  echo "~/n8n.env introuvable : copie n8n-workflows/n8n.env.example vers ~/n8n.env." >&2
  exit 1
fi

docker rm -f n8n >/dev/null 2>&1 || true
docker run -d --name n8n --restart unless-stopped -p 5678:5678 \
  --env-file "$HOME/n8n.env" -v "$HOME/n8n-data:/home/node/.n8n" n8nio/n8n >/dev/null

printf 'Démarrage de n8n'
for _ in $(seq 1 30); do
  if curl -fs http://localhost:5678/healthz >/dev/null 2>&1; then echo ' : prêt'; exit 0; fi
  printf '.'; sleep 2
done
echo ' : n8n ne répond pas, voir docker logs n8n' >&2
exit 1
