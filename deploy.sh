#!/bin/bash
set -euo pipefail

# Deploy modes:
#   DEPLOY_MODE=pull  (default) - pull the prebuilt image from GHCR and run it.
#                                 Safe for low-memory VPSes: no build happens here.
#   DEPLOY_MODE=build           - build the image on this machine (needs ~2GB RAM
#                                 for the Next.js build stage).
DEPLOY_MODE="${DEPLOY_MODE:-pull}"

echo "Git Pulling..."
git pull --ff-only

if [ "$DEPLOY_MODE" = "pull" ]; then
  echo "Pulling prebuilt image from GHCR..."
  if docker compose pull app; then
    docker compose up -d --no-build
  else
    echo "Image pull failed (is the GitHub Actions build finished and the package public,"
    echo "or are you logged in via 'docker login ghcr.io'?)."
    echo "Falling back to a local build. This needs ~2GB of free memory."
    DEPLOY_MODE=build
  fi
fi

if [ "$DEPLOY_MODE" = "build" ]; then
  if [ ! -f portfolio/package.json ]; then
    echo "Missing portfolio/package.json. The Next.js portfolio source is required for Docker builds."
    exit 1
  fi
  echo "Building API and HTTPS proxy locally..."
  docker compose up -d --build
fi

if [ "${PRUNE_DOCKER:-0}" = "1" ]; then
  echo "Pruning unused Docker build cache and images..."
  docker system df
  docker builder prune -af
  docker image prune -af
fi

if [ "${POPULATE_CHROMA:-0}" = "1" ]; then
  echo "Populating ChromaDB from data/personal.json..."
  docker compose run --rm app python populate_chroma.py
else
  echo "Skipping ChromaDB population. Set POPULATE_CHROMA=1 to rebuild it."
fi

echo "App and HTTPS proxy logs..."
docker compose logs --tail=100 app caddy

if [ "${FOLLOW_LOGS:-0}" = "1" ]; then
  docker compose logs -f app caddy
fi
