#!/usr/bin/env bash
# Lance tout LinkedAI en local : PostgreSQL et n8n (Docker), le backend (:4000) et le front (:3000).
# Ctrl+C arrête le backend et le front. PostgreSQL et n8n restent actifs dans Docker.
set -u
cd "$(dirname "$0")/.."

if ! docker info >/dev/null 2>&1; then
  echo "Docker n'est pas lancé. Ouvre Docker Desktop puis relance." >&2
  exit 1
fi

if docker ps -a --format '{{.Names}}' | grep -qx n8n; then
  docker start n8n >/dev/null
else
  echo "Conteneur n8n introuvable. Crée-le d'abord (voir README, section n8n)." >&2
  exit 1
fi

# PostgreSQL (docker-compose.yml) : démarré, attendu, puis migrations appliquées.
docker compose up -d --wait db >/dev/null || { echo "PostgreSQL n'a pas démarré (docker compose logs db)." >&2; exit 1; }

if [ ! -f backend/.env ]; then
  echo "backend/.env est absent : copie backend/.env.example puis renseigne OPENROUTER_API_KEY." >&2
  exit 1
fi

printf 'Attente de n8n'
for _ in $(seq 1 30); do
  if curl -fs http://localhost:5678/healthz >/dev/null 2>&1; then echo ' : prêt'; break; fi
  printf '.'; sleep 2
done

npm --prefix backend run --silent db:init >/dev/null || { echo "Migrations PostgreSQL en échec : npm run db:init --prefix backend" >&2; exit 1; }

trap 'kill 0' INT TERM
npm --prefix backend run dev &
npm --prefix frontend run dev &
wait
