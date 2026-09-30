import fs from 'node:fs';
import path from 'node:path';
import { readProject, workflowPath } from './project.mjs';
import { run } from './util.mjs';

async function versionCheck(id, command, args) {
  const result = await run(command, args, { capture: true, allowFailure: true });
  return { id, ok: result.code === 0, value: result.stdout || result.stderr || null };
}

export async function doctor(root, flags = {}) {
  const checks = [];
  checks.push(await versionCheck('node', 'node', ['--version']));
  checks.push(await versionCheck('npm', 'npm', ['--version']));
  checks.push(await versionCheck('git', 'git', ['--version']));
  checks.push(await versionCheck('gh', 'gh', ['--version']));
  const auth = await run('gh', ['auth', 'status'], { capture: true, allowFailure: true });
  checks.push({ id: 'github-auth', ok: auth.code === 0, value: auth.code === 0 ? 'authenticated' : 'authentication-required' });
  try {
    const project = readProject(root);
    checks.push({ id: 'package', ok: true, value: `${project.pkg.name}@${project.pkg.version}` });
    checks.push({ id: 'publish-access', ok: project.pkg.publishConfig?.access === 'public', value: project.pkg.publishConfig?.access || null });
  } catch (error) {
    checks.push({ id: 'package', ok: false, value: error.message });
  }
  const workflow = workflowPath(root, String(flags.workflow || 'publish-npm.yml'));
  checks.push({ id: 'workflow', ok: fs.existsSync(workflow), value: path.relative(root, workflow) });
  return { ok: checks.every((check) => check.ok), root, checks };
}
