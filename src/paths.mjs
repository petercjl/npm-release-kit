import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const packageJsonPath = path.join(packageRoot, 'package.json');
export const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
export const skillSource = path.join(packageRoot, 'skill', 'npm-release-kit');

export function skillTargets() {
  const home = os.homedir();
  return {
    codex: path.join(process.env.CODEX_HOME || path.join(home, '.codex'), 'skills', 'npm-release-kit'),
    sealseek: path.join(process.env.SEALSEEK_HOME || path.join(home, '.sealseek'), 'skill_pool', 'npm-release-kit')
  };
}
