import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = process.env.CPANEL_HOST || 'ibdix.allserverdns.com';
const user = process.env.CPANEL_USER || 'banglabo';
const site = process.env.CPANEL_SITE || 'samimreza.me';
const app = process.env.CPANEL_APP || 'samimreza-app';
const skipBuild = process.env.DEPLOY_SKIP_BUILD === '1';

function run(command, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: 'inherit',
      shell: false,
      env: { ...process.env, ...extraEnv },
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} failed (${code})`));
    });
  });
}

async function main() {
  if (!skipBuild) {
    console.log('Building static site...');
    await run(process.execPath, [path.join(root, 'scripts', 'build-static.mjs')]);
  }

  const outDir = path.join(root, 'out');
  if (!existsSync(outDir)) {
    throw new Error('Missing out/. Run without DEPLOY_SKIP_BUILD=1 first.');
  }

  const entries = await readdir(outDir, { withFileTypes: true });
  const batch = [];
  batch.push(`lcd ${outDir}`);
  batch.push(`cd ${site}`);
  for (const entry of entries) {
    if (entry.name === '.htaccess') continue;
    batch.push(entry.isDirectory() ? `put -r ${entry.name}` : `put ${entry.name}`);
  }

  const htaccess = path.join(root, 'deploy', 'cpanel', 'htaccess');
  const startup = path.join(root, 'deploy', 'cpanel', 'startup.js');
  const profile = path.join(root, 'src', 'server', 'personal.json');

  batch.push(`lcd ${path.dirname(htaccess)}`);
  batch.push(`cd /home/${user}/${site}`);
  batch.push('put htaccess .htaccess');

  batch.push(`lcd ${path.dirname(startup)}`);
  batch.push(`cd /home/${user}/${app}`);
  batch.push('put startup.js startup.js');

  if (existsSync(profile)) {
    batch.push(`lcd ${path.dirname(profile)}`);
    batch.push(`cd /home/${user}/${app}/src/server`);
    batch.push('put personal.json personal.json');
  } else {
    console.warn('Skipping profile upload: src/server/personal.json is missing.');
  }

  batch.push('bye');

  const batchFile = path.join(await mkdtemp(path.join(os.tmpdir(), 'cpanel-deploy-')), 'batch');
  await writeFile(batchFile, `${batch.join('\n')}\n`);

  console.log(`Uploading to ${user}@${host} (${site} + ${app})...`);
  await run('sftp', [
    '-o',
    'BatchMode=yes',
    '-o',
    'ConnectTimeout=25',
    '-b',
    batchFile,
    `${user}@${host}`,
  ]);

  console.log('Deploy finished. Check https://samimreza.me');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
