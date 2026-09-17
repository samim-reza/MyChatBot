import { Client } from 'basic-ftp';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const envFile of ['.env.local', '.env']) {
  const envPath = path.join(root, envFile);
  if (existsSync(envPath)) process.loadEnvFile(envPath);
}

const host = process.env.CPANEL_HOST || 'ibdix.allserverdns.com';
const ftpUser = process.env.CPANEL_FTP_USER || 'deploy@samimreza.me';
const ftpPassword = process.env.CPANEL_FTP_PASSWORD;
const site = process.env.CPANEL_SITE || 'samimreza.me';
const app = process.env.CPANEL_APP || 'samimreza-app';
const skipBuild = process.env.DEPLOY_SKIP_BUILD === '1';

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: root, stdio: 'inherit', shell: false });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} failed (${code})`));
    });
  });
}

async function main() {
  if (!ftpPassword) {
    throw new Error(
      'Missing CPANEL_FTP_PASSWORD. Set it in .env (see .env.example) — this host blocks SSH, so deploys go over FTP with the "deploy" FTP account created in cPanel.',
    );
  }

  if (!skipBuild) {
    console.log('Building static site...');
    await run(process.execPath, [path.join(root, 'scripts', 'build-static.mjs')]);
  }

  const outDir = path.join(root, 'out');
  if (!existsSync(outDir)) {
    throw new Error('Missing out/. Run without DEPLOY_SKIP_BUILD=1 first.');
  }

  const htaccess = path.join(root, 'deploy', 'cpanel', 'htaccess');
  const startup = path.join(root, 'deploy', 'cpanel', 'startup.js');
  const profile = path.join(root, 'src', 'server', 'personal.json');

  console.log(`Uploading to ${ftpUser} (${host})...`);
  const client = new Client(30_000);
  try {
    await client.access({ host, user: ftpUser, password: ftpPassword, secure: false });

    // The "deploy" FTP account's own root is already /home/banglabo, so paths
    // below are relative to that, not absolute filesystem paths.
    console.log(`Syncing static site to /${site}...`);
    await client.ensureDir(`/${site}`);
    await client.uploadFromDir(outDir);

    console.log('Restoring Passenger .htaccess...');
    await client.cd(`/${site}`);
    await client.uploadFrom(htaccess, '.htaccess');

    console.log(`Uploading chat server to /${app}...`);
    await client.cd(`/${app}`);
    await client.uploadFrom(startup, 'startup.js');

    if (existsSync(profile)) {
      console.log('Uploading src/server/personal.json...');
      await client.ensureDir(`/${app}/src/server`);
      await client.uploadFrom(profile, 'personal.json');
    } else {
      console.warn('Skipping profile upload: src/server/personal.json is missing.');
    }
  } finally {
    client.close();
  }

  console.log('Deploy finished. Check https://samimreza.me');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
