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

- Run this on the machine that already has SFTP to `banglabo@ibdix.allserverdns.com`
- SSH key: `~/.ssh/id_ed25519`
- `src/server/personal.json` and Groq env must already exist locally
