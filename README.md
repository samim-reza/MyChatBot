# Samim Reza Portfolio + AI Chatbot

Single-domain portfolio and personal RAG chatbot for Samim Reza.

- `https://samimreza.me/` serves the portfolio
- `https://samimreza.me/chat` serves the chatbot-only page
- the portfolio chat toggle talks to the same chatbot API directly, without an iframe
- Caddy handles HTTPS certificates and redirects `www.samimreza.me` to `samimreza.me`

## What it does

- serves the Next.js portfolio from `portfolio/out` via FastAPI
- answers questions about Samim from structured profile data
- streams responses in the browser
- keeps short-term chat context with compacted conversation memory
- uses local Chroma storage for retrieval

## Stack

- Python 3.10
- FastAPI
- Groq API
- ChromaDB
- React / Next.js (`portfolio/`)
- Docker / Docker Compose
- Caddy for HTTPS

## Project structure

```text
MyChatBot/
├── app.py
├── bot_chroma.py
├── Caddyfile
├── Dockerfile
├── docker-compose.yml
├── deploy.sh
├── populate_chroma.py
├── requirements.txt
├── portfolio/          # Next.js portfolio
├── data/
│   ├── personal.json
│   └── chroma_db/
├── services/
│   ├── chroma_service.py
│   ├── date_utils.py
│   ├── embeddings.py
│   └── groq_service.py
└── static/
    └── chat.html
```

## Required files

Before running the app, make sure these exist:

- `.env`
- `data/personal.json`

Example `.env`:

```env
GROQ_API_KEY=your_groq_api_key
PORT=8000
```

## Local run without Docker

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 populate_chroma.py
cd portfolio
npm ci
npm run build
cd ..
python3 app.py
```

Open:

```text
http://localhost:8000
```

Local paths:

- `http://localhost:8000/` - portfolio
- `http://localhost:8000/chat` - chatbot-only page
- `http://localhost:8000/api/debug/config` - health/config check

## Run with Docker

```bash
docker compose up -d --build
docker compose run --rm app python populate_chroma.py
docker compose logs -f app caddy
```

## Deployment (low-memory friendly)

The Next.js build inside the Docker image needs ~2GB of RAM, which used to
fill up small VPSes and kill the deploy. To avoid that, GitHub Actions
(`.github/workflows/docker-publish.yml`) builds the image on every push to
`master` and publishes it to `ghcr.io/samim-reza/mychatbot:latest`. The VPS
then only pulls and runs it — no build happens on the server.

One-time setup:

1. push to GitHub and let the `Build and publish Docker image` workflow finish
2. make the GHCR package public (repo → Packages → mychatbot → settings), or
   run `docker login ghcr.io` on the VPS with a personal access token
   (`read:packages` scope)

Deploying on the VPS:

```bash
./deploy.sh                     # pulls the prebuilt image (default)
DEPLOY_MODE=build ./deploy.sh   # builds locally instead (needs ~2GB RAM)
POPULATE_CHROMA=1 ./deploy.sh   # also rebuilds the vector database
```

If the pull fails (e.g. workflow not finished yet), `deploy.sh` warns and
falls back to a local build.

## DigitalOcean deployment

On the droplet:

1. install Docker and Docker Compose plugin
2. point DNS `A` records for `samimreza.me` and `www.samimreza.me` to the droplet IP
3. make sure ports `80` and `443` are open in the DigitalOcean firewall
4. clone the repo
5. create `.env`
6. place your private profile file at `data/personal.json`
7. start the app and build the vector database

Commands:

```bash
git clone https://github.com/samim-reza/MyChatBot.git
cd MyChatBot
mkdir -p data/chroma_db
./deploy.sh
docker compose run --rm app python populate_chroma.py
docker compose logs -f app caddy
```

After DNS points to the droplet, Caddy automatically requests and renews HTTPS certificates.

Production URLs:

- `https://samimreza.me/` - portfolio
- `https://samimreza.me/chat` - chatbot-only page
- `https://samimreza.me/api/chat/stream` - streaming chat API

## Useful Docker commands

```bash
docker compose up -d --build
docker compose restart app caddy
docker compose logs -f app caddy
docker compose run --rm app python populate_chroma.py
docker compose down
```

## API endpoints

- `/api/chat/stream` - streaming chat endpoint
- `/api/debug/config` - debug and health info

## Notes

- `data/personal.json` is ignored by git because it contains private data.
- `data/chroma_db/` is generated data and is also ignored by git.
- `data/personal.json` is the source of truth for the chatbot knowledge.
- if you update `data/personal.json`, run `python populate_chroma.py` again.
- `portfolio/out/` is generated during the Next.js export build and served by FastAPI.
