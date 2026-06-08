#!/bin/bash
# Deploy app

echo "Git Pulling..."
git pull

echo "Building app..."
docker compose up -d --build

docker compose run --rm app python populate_chroma.py

echo "Backend Logs..."
docker compose logs -f app
