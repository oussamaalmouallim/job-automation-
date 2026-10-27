#!/usr/bin/env bash
# Lance tout LinkedAI en local : n8n (Docker), le backend (:4000) et le front (:3000).
# Ctrl+C arrête le backend et le front. n8n reste actif dans Docker (docker stop n8n pour l'arrêter).
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

if [ ! -f backend/.env ]; then
  echo "backend/.env est absent : copie backend/.env.example puis renseigne OPENROUTER_API_KEY." >&2
  exit 1
fi

printf 'Attente de n8n'
for _ in $(seq 1 30); do
  if curl -fs http://localhost:5678/healthz >/dev/null 2>&1; then echo ' : prêt'; break; fi
  printf '.'; sleep 2
done

trap 'kill 0' INT TERM
npm --prefix backend run dev &
npm --prefix frontend run dev &
wait
