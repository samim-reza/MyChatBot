# MyChatBot

Personal RAG chatbot for Samim Reza, built with FastAPI, ChromaDB, Groq, and a lightweight custom embedding function.

## What it does

- answers questions about Samim from structured profile data and CV content
- streams responses in the browser
- keeps short-term chat context with compacted conversation memory
- uses local Chroma storage for retrieval

## Stack

- Python 3.10
- FastAPI
- Groq API
- ChromaDB
- Docker / Docker Compose

## Project structure

```text
MyChatBot/
├── app.py
├── bot_chroma.py
├── Dockerfile
├── docker-compose.yml
├── populate_chroma.py
├── requirements.txt
├── data/
│   ├── cv.tex
│   ├── personal.json
│   └── chroma_db/
├── docs/
│   └── app.md
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

`data/cv.tex` is already included in the repo and baked into the Docker image.

Example `.env`:

```env
GROQ_API_KEY=your_groq_api_key
```

## Local run without Docker

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 populate_chroma.py
python3 app.py
```

Open:

```text
http://localhost:8000
```

## Run with Docker

```bash
docker compose up -d --build
docker compose run --rm app python populate_chroma.py
docker compose logs -f app
```

## DigitalOcean deployment

On the droplet:

1. install Docker and Docker Compose plugin
2. clone the repo
3. create `.env`
4. place your private profile file at `data/personal.json`
5. start the app and build the vector database

Commands:

```bash
git clone https://github.com/samim-reza/MyChatBot.git
cd MyChatBot
mkdir -p data/chroma_db
docker compose up -d --build
docker compose run --rm app python populate_chroma.py
docker compose logs -f app
```

If port `8000` is open on the server firewall, the app will be available at:

```text
http://YOUR_DROPLET_IP:8000
```

## Nginx reverse proxy

Ready config:

- [docs/nginx-samimreza.me.conf](/home/samim01/Code/MyChatBot/docs/nginx-samimreza.me.conf)

Install it on the VPS with:

```bash
sudo cp docs/nginx-samimreza.me.conf /etc/nginx/sites-available/samimreza.me
sudo ln -s /etc/nginx/sites-available/samimreza.me /etc/nginx/sites-enabled/samimreza.me
sudo nginx -t
sudo systemctl reload nginx
```

## Useful Docker commands

```bash
docker compose up -d --build
docker compose restart app
docker compose logs -f app
docker compose run --rm app python populate_chroma.py
docker compose down
```

## API endpoints

- `/` - chat UI
- `/api/chat/stream` - streaming chat endpoint
- `/api/debug/config` - debug and health info

## Notes

- `data/personal.json` is ignored by git because it contains private data.
- `data/chroma_db/` is generated data and is also ignored by git.
- `data/cv.tex` is baked into the Docker image and does not need to be mounted from the VPS.
- if you update `data/personal.json` or `data/cv.tex`, run `python populate_chroma.py` again.
