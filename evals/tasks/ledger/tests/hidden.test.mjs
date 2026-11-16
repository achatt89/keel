// Hidden acceptance tests. The agent never sees these. SUBMISSION = the agent's project folder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = process.env.SUBMISSION;
const cli = join(dir, 'src/cli.js');
function ledger() {
  const file = join(mkdtempSync(join(tmpdir(), 'ledger-')), 'data.json');
  const run = (...args) => {
    const r = spawnSync('node', [cli, ...args], { cwd: dir, env: { ...process.env, LEDGER_FILE: file }, encoding: 'utf8', timeout: 10000 });
    return { code: r.status, out: r.stdout.trim(), err: r.stderr.trim() };
  };
  const ok = (...args) => { const r = run(...args); assert.equal(r.code, 0, `${args.join(' ')} -> ${r.code} ${r.err}`); return r.out; };
  return { run, ok, file };
}

test('entry point exists', () => assert.ok(existsSync(cli)));

test('add returns increasing ids, never reused; data file created', () => {
  const l = ledger();
  assert.equal(l.ok('add', 'alice', '12.50', 'alice,bob'), '1');
  assert.equal(l.ok('add', 'bob', '3', 'alice'), '2');
  assert.ok(existsSync(l.file));
  l.ok('remove', '2');
  assert.equal(l.ok('add', 'bob', '1', 'alice'), '3');
});

test('list format with note, oldest first', () => {
  const l = ledger();
  l.ok('add', 'alice', '12.5', 'alice,bob', '--note', 'pizza night');
  l.ok('add', 'bob', '7', 'carol');
  assert.equal(l.ok('list'), '1 alice 12.50 alice,bob # pizza night\n2 bob 7.00 carol');
});

test('balances: signed, sorted, zero shown', () => {
  const l = ledger();
  l.ok('add', 'carol', '20', 'alice,bob');
  l.ok('add', 'dave', '5', 'dave');
  assert.equal(l.ok('balances'), 'alice: -10.00\nbob: -10.00\ncarol: +20.00\ndave: 0.00');
});

test('leftover cents go alphabetically and reconcile exactly', () => {
  const l = ledger();
  l.ok('add', 'zed', '0.10', 'carol,alice,bob'); // 4,3,3 -> alice 4, bob 3, carol 3
  assert.equal(l.ok('balances'), 'alice: -0.04\nbob: -0.03\ncarol: -0.03\nzed: +0.10');
});

test('no float drift over many small expenses', () => {
  const l = ledger();
  for (let i = 0; i < 10; i++) l.ok('add', 'alice', '0.1', 'bob');
  l.ok('add', 'alice', '0.2', 'bob');
  assert.equal(l.ok('balances'), 'alice: +1.20\nbob: -1.20');
});

test('settle follows the stated greedy algorithm', () => {
  const l = ledger();
  l.ok('add', 'alice', '90', 'alice,bob,carol'); // a +60, b -30, c -30
  l.ok('add', 'dave', '40', 'bob,carol,erin,frank'); // d +40, b -40, c -40, e -10, f -10
  // a +60, b -40, c -40, d +40, e -10, f -10
  assert.equal(l.ok('settle'), [
    'bob -> alice: 40.00',
    'carol -> dave: 40.00',
    'erin -> alice: 10.00',
    'frank -> alice: 10.00',
  ].join('\n'));
});

test('settle prints nothing when settled; remove updates balances', () => {
  const l = ledger();
  l.ok('add', 'alice', '10', 'bob');
  l.ok('add', 'bob', '10', 'alice');
  assert.equal(l.ok('settle'), '');
  l.ok('remove', '2');
  assert.equal(l.ok('settle'), 'bob -> alice: 10.00');
});

for (const [why, args] of [
  ['unknown command', ['frobnicate']],
  ['no command', []],
  ['bad name', ['add', 'Alice', '10', 'bob']],
  ['bad participant', ['add', 'alice', '10', 'bob,b0b']],
  ['three decimals', ['add', 'alice', '10.123', 'bob']],
  ['negative amount', ['add', 'alice', '-5', 'bob']],
  ['zero amount', ['add', 'alice', '0', 'bob']],
  ['missing participants', ['add', 'alice', '10']],
  ['unknown id', ['remove', '99']],
]) {
  test(`invalid input exits 2 with error: (${why})`, () => {
    const r = ledger().run(...args);
    assert.equal(r.code, 2);
    assert.match(r.err, /^error:/);
  });
}
