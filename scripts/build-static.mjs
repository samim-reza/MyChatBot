import { spawn } from 'node:child_process';
import { rename } from 'node:fs/promises';
import path from 'node:path';

const api = path.join('src', 'app', 'api');
const parked = path.join('.export-api-park');

async function restore() {
  try {
    await rename(parked, api);
  } catch {
    // already restored
  }
}

async function main() {
  await rename(api, parked);
  try {
    const code = await new Promise((resolve) => {
      const child = spawn('npx', ['next', 'build'], {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, STATIC_EXPORT: '1' },
      });
      child.on('exit', (exitCode) => resolve(exitCode ?? 1));
    });
    await restore();
    process.exit(Number(code));
  } catch (error) {
    await restore();
    throw error;
  }
}

main();
