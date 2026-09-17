# Deploy to samimreza.me

From this laptop, in the repo root:

```bash
npm run deploy
```

That is the whole live update. GitHub push does **not** deploy.

## What it does

1. Builds the static site
2. Uploads pages to `samimreza.me`
3. Restores the Passenger `.htaccess` so chat stays on Node
4. Uploads the chat server and `src/server/personal.json`

## Upload only (skip rebuild)

```bash
DEPLOY_SKIP_BUILD=1 npm run deploy
```

## Requirements

- This host blocks SSH/SFTP (port 22) on our plan, so the deploy uploads over
  plain FTP (port 21) instead, using a dedicated "deploy" FTP account scoped
  to the account's home directory (cPanel > Files > FTP Accounts).
- `CPANEL_FTP_PASSWORD` (and optionally `CPANEL_FTP_USER`, default
  `deploy@samimreza.me`) must be set in `.env` — see `.env.example`.
- `src/server/personal.json` and Groq env must already exist locally
