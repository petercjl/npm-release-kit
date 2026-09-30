import path from 'node:path';
import fs from 'node:fs';
import { packageJson, skillSource } from './paths.mjs';
import { parseArgs, output, CliError } from './util.mjs';
import { initialize } from './init.mjs';
import { doctor } from './doctor.mjs';
import { trustCommand, trustSetup } from './trust.mjs';
import { triggerPublish, ciPublish } from './publish.mjs';
import { installSkills, skillStatus } from './skill.mjs';
import { checkUpdate, installUpdate } from './update.mjs';

const help = `npm-release-kit

Commands:
  version
  capabilities [--json]
  doctor [--root <path>] [--workflow <file>] [--json]
  init [--root <path>] [--workflow <file>] [--dry-run|--yes]
  trust command [--root <path>] [--stage-only] [--json]
  trust setup [--root <path>] [--stage-only] --yes
  publish --release <patch|minor|major|prerelease|semver> [--tag <tag>] --yes
  ci publish --release <type> --tag <tag>
  skill source|status|install|update [--agent codex|sealseek]
  update check|install [--yes]
`;

function rootFrom(flags) { return path.resolve(String(flags.root || process.cwd())); }

export async function main(argv) {
  const { positional, flags } = parseArgs(argv);
  const [command, subcommand] = positional;
  if (!command || command === 'help' || flags.help) return output(help, false);
  if (command === 'version') return output({ name: packageJson.name, version: packageJson.version });
  if (command === 'capabilities') return output(JSON.parse(fs.readFileSync(new URL('../capabilities.json', import.meta.url), 'utf8')));
  if (command === 'doctor') return output(await doctor(rootFrom(flags), flags));
  if (command === 'init') return output(await initialize(rootFrom(flags), flags));
  if (command === 'trust' && subcommand === 'command') return output(await trustCommand(rootFrom(flags), flags));
  if (command === 'trust' && subcommand === 'setup') return output(await trustSetup(rootFrom(flags), flags));
  if (command === 'publish') return output(await triggerPublish(rootFrom(flags), flags));
  if (command === 'ci' && subcommand === 'publish') return output(await ciPublish(flags));
  if (command === 'skill' && subcommand === 'source') return output({ ok: true, source: skillSource });
  if (command === 'skill' && subcommand === 'status') return output(skillStatus());
  if (command === 'skill' && (subcommand === 'install' || subcommand === 'update')) return output(installSkills(flags));
  if (command === 'update' && subcommand === 'check') return output(await checkUpdate());
  if (command === 'update' && subcommand === 'install') return output(await installUpdate(flags));
  throw new CliError('UNKNOWN_COMMAND', `Unknown command: ${positional.join(' ')}`);
}
