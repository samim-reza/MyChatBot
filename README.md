# Samim Reza

Personal site for [samimreza.me](https://samimreza.me): portfolio, writing, and an AI chat that answers as Samim.

```text
.
├── src/
│   ├── app/                 App Router pages + chat API
│   │   ├── api/chat/stream/ Groq streaming route
│   │   └── chat/            full-page chat
│   ├── components/          UI grouped by area
│   │   ├── chat/
│   │   ├── landing/
│   │   ├── journey/
│   │   ├── projects/
│   │   └── ui/
│   ├── config/              site copy and metadata
│   ├── content/             MDX for blog, projects, journey
│   ├── hooks/
│   ├── lib/
│   │   └── chat/            browser helper + server RAG
│   ├── server/              private profile (not committed)
│   └── types/
├── public/                  images, fonts, static assets
├── deploy/cpanel/           LiteSpeed / Passenger files
├── server.js                Next.js production server
├── next.config.ts
└── package.json
```

## Run locally

```bash
cp src/server/personal.example.json src/server/personal.json
cp .env.example .env.local
# put GROQ_API_KEY in .env.local
npm install
npm run dev
```

- http://localhost:3000
- http://localhost:3000/chat
- `POST http://localhost:3000/api/chat/stream/`

## Production

This is a Next.js + TypeScript app. No Python, Docker, or PHP.

```bash
npm run build
npm start
```

`src/server/personal.json` is read only on the server and is gitignored.

### cPanel / LiteSpeed

Shared hosting cannot reliably boot full Next.js under Passenger, and GitHub Actions cannot reach this host. After you push, deploy from this machine. Full notes: [DEPLOY.md](DEPLOY.md).

```bash
npm run deploy
```

That command:

1. Builds the static site
2. Uploads `out/` to `samimreza.me` (does not keep the export `.htaccess`)
3. Restores the Passenger `.htaccess` so chat stays on Node
4. Uploads `deploy/cpanel/startup.js` and `src/server/personal.json` to `samimreza-app`

SFTP must already work with your SSH key (`banglabo@ibdix.allserverdns.com`). To upload files without rebuilding:

```bash
DEPLOY_SKIP_BUILD=1 npm run deploy
```
