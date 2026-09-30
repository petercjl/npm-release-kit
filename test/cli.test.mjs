import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parseArgs, run } from '../src/util.mjs';
import { initialize } from '../src/init.mjs';

test('parseArgs separates positionals and flags', () => {
  assert.deepEqual(parseArgs(['publish', '--release', 'patch', '--yes']), { positional: ['publish'], flags: { release: 'patch', yes: true } });
});

async function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'npm-release-kit-'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: '@example/demo', version: '1.0.0' }));
  await run('git', ['init', '-b', 'main'], { cwd: root, capture: true });
  await run('git', ['remote', 'add', 'origin', 'git@github.com:example/demo.git'], { cwd: root, capture: true });
  return root;
}

test('init creates a workflow once and remains idempotent', async () => {
  const root = await fixture();
  assert.equal((await initialize(root, { yes: true })).changed, true);
  assert.equal((await initialize(root, { yes: true })).changed, false);
});

test('init refuses to replace an existing workflow', async () => {
  const root = await fixture();
  const target = path.join(root, '.github', 'workflows');
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'publish-npm.yml'), 'user content\n');
  await assert.rejects(() => initialize(root, { yes: true }), (error) => error.code === 'TARGET_EXISTS');
});
