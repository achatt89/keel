import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const cli = new URL('../src/cli.js', import.meta.url).pathname;
const env = { ...process.env, LEDGER_FILE: join(mkdtempSync(join(tmpdir(), 'l-')), 'l.json') };
const run = (...a) => execFileSync('node', [cli, ...a], { env, encoding: 'utf8' }).trim();

test('leftover cents and settle', () => {
  run('add', 'alice', '10', 'alice,bob,carol');
  assert.equal(run('balances'), 'alice: +6.66\nbob: -3.33\ncarol: -3.33');
  assert.equal(run('settle'), 'bob -> alice: 3.33\ncarol -> alice: 3.33');
});
