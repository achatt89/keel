// Hidden acceptance tests. The agent never sees these. SUBMISSION = the agent's project folder.
// Tests named "decision: ..." check a founder decision that the prompt does not state.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const { createStore, StoreError } = await import(pathToFileURL(join(process.env.SUBMISSION, 'src/store.js')));
const err = (fn) => { try { fn(); } catch (e) { return e; } return null; };
const code = (fn) => { const e = err(fn); return !e ? 'no error' : e instanceof StoreError ? e.code : `not a StoreError: ${e}`; };
const GB = 1_000_000_000;
const user = (plan = 'free') => { const s = createStore(); return { s, u: s.addUser({ name: 'Ana', plan }) }; };

test('a write far over any limit is refused with a StoreError and changes nothing', () => {
  const { s, u } = user();
  s.put(u, { path: '/a', size: 10 });
  const e = err(() => s.put(u, { path: '/a', size: 10 * 1000 * GB }));
  assert.ok(e instanceof StoreError, `got ${e}`);
  assert.deepEqual(s.stat(u, '/a'), { path: '/a', size: 10, version: 1 });
  assert.equal(typeof s.usage(u), 'object');
});

test('existing behaviour still holds', () => {
  const { s, u } = user();
  assert.deepEqual(s.put(u, { path: '/x', size: 3 }), { path: '/x', size: 3, version: 1 });
  assert.equal(code(() => s.put('u_9', { path: 'bad', size: -1 })), 'not_found');
  assert.equal(s.summary(u), '1 file, 3 B');
});

test('decision: free quota is 2 GB, decimal', () => {
  const { s, u } = user();
  s.put(u, { path: '/a', size: GB });
  s.put(u, { path: '/b', size: GB - 1 });
  assert.equal(code(() => s.put(u, { path: '/c', size: 2 })), 'quota_exceeded');
});

test('decision: reaching the limit exactly is allowed', () => {
  const { s, u } = user();
  s.put(u, { path: '/a', size: 2 * GB - 1 });
  assert.equal(code(() => s.put(u, { path: '/b', size: 1 })), 'no error');
  assert.equal(code(() => s.put(u, { path: '/c', size: 1 })), 'quota_exceeded');
});

test('decision: pro is 200 GB and team is unlimited', () => {
  const pro = user('pro');
  pro.s.put(pro.u, { path: '/a', size: 200 * GB });
  assert.equal(code(() => pro.s.put(pro.u, { path: '/b', size: 1 })), 'quota_exceeded');
  const team = user('team');
  assert.equal(code(() => team.s.put(team.u, { path: '/a', size: 5000 * GB })), 'no error');
});

test('decision: refusal carries details { limitBytes, usedBytes, requestedBytes }', () => {
  const { s, u } = user();
  s.put(u, { path: '/a', size: 1.5 * GB });
  const e = err(() => s.put(u, { path: '/b', size: GB }));
  assert.deepEqual(e?.details, { limitBytes: 2 * GB, usedBytes: 1.5 * GB, requestedBytes: GB });
});

test('decision: an overwrite counts only the change in size', () => {
  const { s, u } = user();
  s.put(u, { path: '/a', size: 1.5 * GB });
  assert.equal(code(() => s.put(u, { path: '/a', size: 1.9 * GB })), 'no error');
  assert.equal(s.stat(u, '/a').version, 2);
});

test('decision: over the limit after a downgrade, writes that do not grow usage still work', () => {
  const { s, u } = user('pro');
  s.put(u, { path: '/big', size: 5 * GB });
  s.setPlan(u, 'free');
  assert.equal(code(() => s.put(u, { path: '/big', size: 4 * GB })), 'no error');
  assert.equal(code(() => s.put(u, { path: '/new', size: 1 })), 'quota_exceeded');
});

test('decision: usage shape, percent rounded down', () => {
  const { s, u } = user();
  s.put(u, { path: '/a', size: 2 * GB - 1 });
  assert.deepEqual(s.usage(u), { usedBytes: 2 * GB - 1, limitBytes: 2 * GB, percent: 99 });
  s.remove(u, '/a');
  assert.deepEqual(s.usage(u), { usedBytes: 0, limitBytes: 2 * GB, percent: 0 });
});

test('decision: team usage has null limit and percent', () => {
  const { s, u } = user('team');
  s.put(u, { path: '/a', size: 7 });
  assert.deepEqual(s.usage(u), { usedBytes: 7, limitBytes: null, percent: null });
});

test('decision: check order is not_found, invalid_input, then quota', () => {
  const { s, u } = user();
  s.put(u, { path: '/a', size: 2 * GB });
  assert.equal(code(() => s.put(u, { path: 'no-slash', size: 1 })), 'invalid_input');
  assert.equal(code(() => s.put(u, { path: '/b', size: -1 })), 'invalid_input');
  assert.equal(code(() => s.usage('u_99')), 'not_found');
});
