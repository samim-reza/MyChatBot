#!/bin/bash
set -euo pipefail

echo "Git Pulling..."
git pull --ff-only

echo "Checking portfolio source..."
if [ ! -f portfolio/package.json ]; then
  echo "Missing portfolio/package.json. The Next.js portfolio source is required for Docker builds."
  exit 1
fi

if [ "${BUILD_PORTFOLIO:-0}" = "1" ]; then
  if ! command -v npm >/dev/null 2>&1; then
    echo "BUILD_PORTFOLIO=1 was set, but npm is not installed."
    exit 1
  fi
  echo "Building portfolio locally for verification..."
  pushd portfolio >/dev/null
  if [ ! -d node_modules ]; then
    npm ci --no-audit --no-fund --ignore-scripts
  fi
  npm run build
  popd >/dev/null
else
  echo "Skipping local portfolio build. Docker will build portfolio/out inside the image."
fi

if [ "${PRUNE_DOCKER:-0}" = "1" ]; then
  echo "Pruning unused Docker build cache and images..."
  docker system df
  docker builder prune -af
  docker image prune -af
fi

echo "Building API and HTTPS proxy..."
docker compose up -d --build

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
