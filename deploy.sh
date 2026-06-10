#!/bin/bash
set -e

echo "Git Pulling..."
git pull

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

echo "Building API and HTTPS proxy..."
docker compose up -d --build

docker compose run --rm app python populate_chroma.py

echo "App and HTTPS proxy logs..."
docker compose logs -f app caddy
