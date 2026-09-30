import { spawn } from 'node:child_process';

export class CliError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

export function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith('--')) { positional.push(value); continue; }
    const [rawKey, inline] = value.slice(2).split('=', 2);
    if (inline !== undefined) flags[rawKey] = inline;
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) flags[rawKey] = argv[++i];
    else flags[rawKey] = true;
  }
  return { positional, flags };
}

export function run(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: options.cwd, env: options.env || process.env, stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit' });
    let stdout = '';
    let stderr = '';
    if (options.capture) {
      child.stdout.on('data', (chunk) => { stdout += chunk; });
      child.stderr.on('data', (chunk) => { stderr += chunk; });
    }
    child.on('error', reject);
    child.on('close', (code) => {
      const result = { code, stdout: stdout.trim(), stderr: stderr.trim() };
      if (code === 0 || options.allowFailure) resolve(result);
      else reject(new CliError(options.errorCode || 'COMMAND_FAILED', `${command} exited with ${code}`));
    });
  });
}

export function output(value, json = true) { process.stdout.write(json ? `${JSON.stringify(value, null, 2)}\n` : `${value}\n`); }
export function requireYes(flags, action) {
  if (!flags.yes) throw new CliError('CONFIRMATION_REQUIRED', `${action} changes external or repository state; rerun with --yes.`);
}
