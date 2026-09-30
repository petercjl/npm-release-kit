import path from 'node:path';
import { githubRepo, readProject } from './project.mjs';
import { requireYes, run } from './util.mjs';

export async function trustCommand(root, flags = {}) {
  const { pkg } = readProject(root);
  const repo = await githubRepo(root);
  const file = String(flags.workflow || 'publish-npm.yml');
  const args = ['trust', 'github', pkg.name, '--file', file, '--repo', repo];
  args.push(flags['stage-only'] ? '--allow-stage-publish' : '--allow-publish');
  args.push('--yes');
  return { ok: true, package: pkg.name, repository: repo, workflow: path.basename(file), command: ['npm', ...args] };
}

export async function trustSetup(root, flags = {}) {
  requireYes(flags, 'Trusted Publisher setup');
  const spec = await trustCommand(root, flags);
  await run(spec.command[0], spec.command.slice(1), { cwd: root, errorCode: 'TRUST_SETUP_FAILED' });
  return { ...spec, configured: true };
}
