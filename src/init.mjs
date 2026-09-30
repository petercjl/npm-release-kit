import fs from 'node:fs';
import path from 'node:path';
import { packageJson, packageRoot } from './paths.mjs';
import { githubRepo, readProject, workflowPath } from './project.mjs';
import { CliError } from './util.mjs';

export async function initialize(root, flags) {
  const project = readProject(root);
  const repo = await githubRepo(root);
  const filename = String(flags.workflow || 'publish-npm.yml');
  const target = workflowPath(root, filename);
  const template = fs.readFileSync(path.join(packageRoot, 'templates', 'publish-npm.yml'), 'utf8')
    .replaceAll('__KIT_VERSION__', packageJson.version)
    .replaceAll('__PACKAGE_NAME__', project.pkg.name);
  if (fs.existsSync(target)) {
    if (fs.readFileSync(target, 'utf8') !== template) throw new CliError('TARGET_EXISTS', `${target} already exists with different content.`);
    return { ok: true, changed: false, workflow: target, package: project.pkg.name, repository: repo };
  }
  if (!flags.yes && !flags['dry-run']) throw new CliError('CONFIRMATION_REQUIRED', `Creating ${target} requires --yes.`);
  if (!flags['dry-run']) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, template, { flag: 'wx', mode: 0o644 });
  }
  return { ok: true, changed: !flags['dry-run'], dryRun: Boolean(flags['dry-run']), workflow: target, package: project.pkg.name, repository: repo };
}
