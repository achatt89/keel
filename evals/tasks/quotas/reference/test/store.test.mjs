import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, StoreError } from '../src/store.js';
import { formatBytes, GiB } from '../src/units.js';

const code = (fn) => { try { fn(); } catch (e) { assert.ok(e instanceof StoreError); return e.code; } return 'no error'; };

test('users get ids u_N and a plan', () => {
  const s = createStore();
  assert.equal(s.addUser({ name: 'Ana' }), 'u_1');
  assert.equal(s.addUser({ name: 'Bo', plan: 'pro' }), 'u_2');
  assert.deepEqual(s.user('u_2'), { id: 'u_2', name: 'Bo', plan: 'pro', files: 0 });
  assert.equal(code(() => s.addUser({ name: 'Cy', plan: 'gold' })), 'invalid_input');
  assert.equal(code(() => s.addUser({ name: ' ' })), 'invalid_input');
});

test('put creates, then overwrites with a new version', () => {
  const s = createStore();
  const u = s.addUser({ name: 'Ana' });
  assert.deepEqual(s.put(u, { path: '/a.txt', size: 10 }), { path: '/a.txt', size: 10, version: 1 });
  assert.deepEqual(s.put(u, { path: '/a.txt', size: 4 }), { path: '/a.txt', size: 4, version: 2 });
  assert.deepEqual(s.stat(u, '/a.txt'), { path: '/a.txt', size: 4, version: 2 });
});

test('put validates: unknown user first, then path and size', () => {
  const s = createStore();
  const u = s.addUser({ name: 'Ana' });
  assert.equal(code(() => s.put('u_9', { path: 'bad', size: -1 })), 'not_found');
  assert.equal(code(() => s.put(u, { path: 'no-slash', size: 1 })), 'invalid_input');
  assert.equal(code(() => s.put(u, { path: '/a/../b', size: 1 })), 'invalid_input');
  assert.equal(code(() => s.put(u, { path: '/a', size: 1.5 })), 'invalid_input');
  assert.equal(code(() => s.put(u, { path: '/a', size: -1 })), 'invalid_input');
});

test('remove, list by prefix, sorted', () => {
  const s = createStore();
  const u = s.addUser({ name: 'Ana' });
  for (const p of ['/docs/b', '/docs/a', '/img/x']) s.put(u, { path: p, size: 1 });
  assert.deepEqual(s.list(u, '/docs/').map((f) => f.path), ['/docs/a', '/docs/b']);
  s.remove(u, '/docs/a');
  assert.deepEqual(s.list(u).map((f) => f.path), ['/docs/b', '/img/x']);
  assert.equal(code(() => s.remove(u, '/docs/a')), 'not_found');
});

test('setPlan keeps files', () => {
  const s = createStore();
  const u = s.addUser({ name: 'Ana', plan: 'pro' });
  s.put(u, { path: '/a', size: 5 });
  s.setPlan(u, 'free');
  assert.equal(s.user(u).plan, 'free');
  assert.equal(s.list(u).length, 1);
  assert.equal(code(() => s.setPlan(u, 'gold')), 'invalid_input');
});

test('summary and formatBytes', () => {
  const s = createStore();
  const u = s.addUser({ name: 'Ana' });
  s.put(u, { path: '/a', size: 1536 });
  assert.equal(s.summary(u), '1 file, 1.5 KiB');
  assert.equal(formatBytes(3 * GiB), '3.0 GiB');
  assert.equal(formatBytes(12), '12 B');
});

test('quotas: decimal GB, exact limit allowed, overwrite counts the change', () => {
  const GB = 1e9;
  const s = createStore();
  const u = s.addUser({ name: 'Ana' });
  s.put(u, { path: '/a', size: 1.5 * GB });
  s.put(u, { path: '/a', size: 2 * GB });
  const e = (() => { try { s.put(u, { path: '/b', size: 1 }); } catch (x) { return x; } })();
  assert.equal(e.code, 'quota_exceeded');
  assert.deepEqual(e.details, { limitBytes: 2 * GB, usedBytes: 2 * GB, requestedBytes: 1 });
  assert.equal(s.list(u).length, 1);
  assert.deepEqual(s.usage(u), { usedBytes: 2 * GB, limitBytes: 2 * GB, percent: 100 });
});

test('quotas: downgrade keeps shrinking writes allowed; team unlimited', () => {
  const s = createStore();
  const u = s.addUser({ name: 'Ana', plan: 'pro' });
  s.put(u, { path: '/a', size: 5e9 });
  s.setPlan(u, 'free');
  s.put(u, { path: '/a', size: 4e9 });
  assert.equal(code(() => s.put(u, { path: '/b', size: 1 })), 'quota_exceeded');
  assert.equal(s.usage(u).percent, 200);
  const t = s.addUser({ name: 'Bo', plan: 'team' });
  s.put(t, { path: '/x', size: 1e13 });
  assert.deepEqual(s.usage(t), { usedBytes: 1e13, limitBytes: null, percent: null });
});
