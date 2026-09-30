import { githubRepo, readProject } from './project.mjs';
import { CliError, requireYes, run } from './util.mjs';

const releasePattern = /^(patch|minor|major|prerelease|\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;
const tagPattern = /^[a-zA-Z][a-zA-Z0-9._-]*$/;

export async function triggerPublish(root, flags = {}) {
  requireYes(flags, 'Publishing');
  const release = String(flags.release || 'patch');
  const tag = String(flags.tag || (release === 'prerelease' ? 'next' : 'latest'));
  if (!releasePattern.test(release)) throw new CliError('INVALID_RELEASE', 'Use patch, minor, major, prerelease, or an exact semver.');
  if (!tagPattern.test(tag)) throw new CliError('INVALID_TAG', 'Invalid npm dist-tag.');
  const project = readProject(root);
  const repo = flags.repo || await githubRepo(root);
  const workflow = String(flags.workflow || 'publish-npm.yml');
  const args = ['workflow', 'run', workflow, '--repo', repo, '-f', `release=${release}`, '-f', `tag=${tag}`];
  if (flags.ref) args.push('--ref', String(flags.ref));
  await run('gh', args, { cwd: root, errorCode: 'WORKFLOW_DISPATCH_FAILED' });
  return { ok: true, dispatched: true, package: project.pkg.name, repository: repo, workflow, release, tag };
}

export async function ciPublish(flags = {}) {
  if (!process.env.GITHUB_ACTIONS || !process.env.ACTIONS_ID_TOKEN_REQUEST_URL) {
    throw new CliError('OIDC_ENVIRONMENT_REQUIRED', 'ci publish must run in a GitHub-hosted Actions job with id-token: write.');
  }
  const release = String(flags.release || 'patch');
  const tag = String(flags.tag || (release === 'prerelease' ? 'next' : 'latest'));
  if (!releasePattern.test(release) || !tagPattern.test(tag)) throw new CliError('INVALID_RELEASE', 'Invalid release or tag.');
  const args = [
    '--yes', 'release-it@21.1.0', release, '--ci',
    '--npm.publish=true', '--npm.skipChecks=true', `--npm.tag=${tag}`,
    '--git.requireCleanWorkingDir=true', '--git.requireUpstream=true', '--git.push=true',
    '--git.commitMessage=chore: release v${version}', '--git.tagName=v${version}',
    '--github.release=true'
  ];
  if (release === 'prerelease') args.push(`--preRelease=${tag}`);
  await run('npx', args, { errorCode: 'RELEASE_FAILED' });
  const project = readProject(process.cwd());
  return { ok: true, published: true, version: project.pkg.version, tag };
}
