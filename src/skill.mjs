import fs from 'node:fs';
import path from 'node:path';
import { packageJson, skillSource, skillTargets } from './paths.mjs';
import { CliError } from './util.mjs';

function statusFor(agent, target) {
  let installed = false;
  let current = false;
  let mode = null;
  if (fs.existsSync(target)) {
    installed = true;
    const stat = fs.lstatSync(target);
    mode = stat.isSymbolicLink() ? 'symlink' : 'copy';
    if (mode === 'symlink') current = path.resolve(path.dirname(target), fs.readlinkSync(target)) === skillSource;
    else current = fs.existsSync(path.join(target, '.npm-release-kit-managed.json'));
  }
  return { agent, target, installed, current, mode };
}

export function skillStatus() {
  return { ok: true, source: skillSource, agents: Object.entries(skillTargets()).map(([agent, target]) => statusFor(agent, target)) };
}

export function installSkills(flags = {}) {
  const selected = flags.agent ? [String(flags.agent)] : ['codex', 'sealseek'];
  const targets = skillTargets();
  const results = [];
  for (const agent of selected) {
    const target = targets[agent];
    if (!target) throw new CliError('UNKNOWN_AGENT', `Unsupported Agent: ${agent}`);
    if (fs.existsSync(target)) {
      const state = statusFor(agent, target);
      if (state.current) { results.push({ ...state, changed: false }); continue; }
      throw new CliError('TARGET_EXISTS', `${target} exists and is not managed by npm-release-kit.`);
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (process.platform === 'win32') {
      fs.cpSync(skillSource, target, { recursive: true, errorOnExist: true });
      fs.writeFileSync(path.join(target, '.npm-release-kit-managed.json'), `${JSON.stringify({ package: packageJson.name, version: packageJson.version }, null, 2)}\n`, { flag: 'wx' });
    } else fs.symlinkSync(skillSource, target, 'dir');
    results.push({ ...statusFor(agent, target), changed: true });
  }
  return { ok: true, results };
}
