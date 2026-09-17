# Deploy to samimreza.me

GitHub push does **not** deploy. The host blocks every automated upload path
(see below), so deploys are currently a manual upload through cPanel's File
Manager in a browser.

## Deploying

1. Build and package:

   ```bash
   npm run deploy:package
   ```

   This builds the static site into `out/`, swaps in the Passenger `.htaccess`
   (so `/chat` keeps routing to Node), and writes `dist/site.zip`.

2. In cPanel → File Manager, go to `/home/banglabo/samimreza.me`.
3. **Upload** `dist/site.zip` with "Overwrite existing files" ticked.
4. Select `site.zip`, click **Extract**, and extract into `/samimreza.me`.
5. Delete `site.zip` from the server.

Extracting overwrites in place; it never deletes, so files dropped from the
build stay behind until removed by hand.

### If you changed the chat server

`deploy/cpanel/startup.js` and `src/server/personal.json` are not in the zip.
Upload those separately to `/home/banglabo/samimreza-app/` and
`/home/banglabo/samimreza-app/src/server/` respectively.

### Cache-busting previews

LiteSpeed serves stale bytes for URLs that were already cached, and WhatsApp,
Facebook and LinkedIn cache OG images by URL for a long time. When a preview
image changes, give the file a new name (`hero-v2.png` → `hero-v3.png`) and
update `src/config/Meta.tsx`. Overwriting in place is not enough.

## Why it is manual: every automated path is blocked by the host

Verified against the account on the "Budget Hosting 5 GB" plan:

- **SSH/SFTP (22)** — blocked inbound at the server. The account's SSH key is
  correctly authorized in cPanel; packets never reach the daemon. Outbound 22
  from the laptop is fine (`git push` over SSH works), so this is the host.
- **FTP (21)** — the control connection authenticates fine, but the server
  blocks its own passive data port range, so every transfer times out. Arbitrary
  high ports to third-party hosts work from the laptop, so again: the host.
- **cPanel UAPI over HTTPS (2083)** — returns
  `Access denied by Imunify360 bot-protection. IPs used for automation should be
whitelisted`. Whitelisting is a WHM-level setting, so only the host can do it.

To get back to a scripted `npm run deploy`, ask the host (Bahari) for any one of:
whitelisting the laptop's IP in Imunify360 bot-protection, enabling SSH, or
opening the FTP passive port range.
