#!/usr/bin/env node
import { main } from '../src/cli.mjs';

main(process.argv.slice(2)).catch((error) => {
  const code = error.code || 'UNEXPECTED_ERROR';
  process.stderr.write(`${JSON.stringify({ ok: false, error: { code, message: error.message } }, null, 2)}\n`);
  process.exitCode = 1;
});
