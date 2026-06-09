#!/bin/bash
set -e

echo "Git Pulling..."
git pull

echo "Building portfolio, API, and HTTPS proxy..."
docker compose up -d --build

docker compose run --rm app python populate_chroma.py

echo "App and HTTPS proxy logs..."
docker compose logs -f app caddy
