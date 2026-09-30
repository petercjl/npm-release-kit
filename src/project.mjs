import fs from 'node:fs';
import path from 'node:path';
import { CliError, run } from './util.mjs';

export function readProject(root) {
  const packagePath = path.join(root, 'package.json');
  if (!fs.existsSync(packagePath)) throw new CliError('PACKAGE_NOT_FOUND', `No package.json at ${root}`);
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (!pkg.name || !pkg.version) throw new CliError('INVALID_PACKAGE', 'package.json must contain name and version.');
  return { root, packagePath, pkg };
}

export async function githubRepo(root) {
  const result = await run('git', ['remote', 'get-url', 'origin'], { cwd: root, capture: true, errorCode: 'GIT_REMOTE_REQUIRED' });
  const value = result.stdout.replace(/\.git$/, '');
  const match = value.match(/github\.com[:/]([^/]+\/[^/]+)$/);
  if (!match) throw new CliError('GITHUB_REMOTE_REQUIRED', 'origin must point to a GitHub repository.');
  return match[1];
}

export function workflowPath(root, filename = 'publish-npm.yml') {
  if (!/^[A-Za-z0-9._-]+\.ya?ml$/.test(filename)) throw new CliError('INVALID_WORKFLOW_NAME', 'Workflow must be a .yml or .yaml filename.');
  return path.join(root, '.github', 'workflows', filename);
}
