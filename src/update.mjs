import { packageJson } from './paths.mjs';
import { requireYes, run } from './util.mjs';

export async function checkUpdate() {
  const result = await run('npm', ['view', packageJson.name, 'version', '--json'], { capture: true, errorCode: 'REGISTRY_CHECK_FAILED' });
  const latest = JSON.parse(result.stdout);
  return { ok: true, current: packageJson.version, latest, updateAvailable: latest !== packageJson.version };
}

export async function installUpdate(flags = {}) {
  requireYes(flags, 'Global package update');
  await run('npm', ['install', '--global', `${packageJson.name}@latest`], { errorCode: 'UPDATE_FAILED' });
  return { ok: true, updated: true, package: packageJson.name };
}
