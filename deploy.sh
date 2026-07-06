#!/bin/bash
set -euo pipefail

echo "Git Pulling..."
git pull --ff-only

echo "Building portfolio..."
if [ "${BUILD_PORTFOLIO:-0}" = "1" ]; then
  if ! command -v npm >/dev/null 2>&1; then
    echo "BUILD_PORTFOLIO=1 was set, but npm is not installed."
    exit 1
  fi
  pushd samim-reza >/dev/null
  if [ ! -d node_modules ]; then
    npm ci --no-audit --no-fund
  fi
  npm run build
  popd >/dev/null
elif [ -f samim-reza/build/index.html ]; then
  echo "Using committed portfolio build. Set BUILD_PORTFOLIO=1 to rebuild it on this machine."
else
  echo "npm is not installed and samim-reza/build/index.html is missing."
  echo "Install Node.js/npm on the server or commit a fresh samim-reza/build directory."
  exit 1
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
