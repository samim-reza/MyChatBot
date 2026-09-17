import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skipBuild = process.env.DEPLOY_SKIP_BUILD === '1';

const outDir = path.join(root, 'out');
const distDir = path.join(root, 'dist');
const stageDir = path.join(distDir, 'stage');
const archive = path.join(distDir, 'site.zip');

function run(command, args, cwd = root) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit', shell: false });
    child.on('error', reject);
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

  if (!existsSync(outDir)) {
    throw new Error('Missing out/. Run without DEPLOY_SKIP_BUILD=1 first.');
  }

  await rm(distDir, { recursive: true, force: true });
  await mkdir(stageDir, { recursive: true });
  await cp(outDir, stageDir, { recursive: true });

  // The build emits a plain .htaccess; the deployed one also carries the
  // Passenger config that keeps /chat on Node.
  await cp(path.join(root, 'deploy', 'cpanel', 'htaccess'), path.join(stageDir, '.htaccess'));

  // Two passes because `zip -x '.*'` is what keeps junk dotfiles out, and
  // .htaccess has to be added back explicitly.
  await run('zip', ['-qr', archive, '.', '-x', '.*'], stageDir);
  await run('zip', ['-qr', archive, '.htaccess'], stageDir);
  await rm(stageDir, { recursive: true, force: true });

  console.log(`\nPackaged ${path.relative(root, archive)}`);
  console.log('Upload it in cPanel > File Manager > /home/banglabo/samimreza.me');
  console.log('(tick "Overwrite existing files"), then Extract into /samimreza.me.');
  console.log('See DEPLOY.md for why this is manual.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
