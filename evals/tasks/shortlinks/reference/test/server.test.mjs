import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';

test('create, redirect, rate limit', async () => {
  let t = 0;
  const s = createServer({ now: () => t }).listen(0);
  const base = `http://127.0.0.1:${s.address().port}`;
  const post = (body) => fetch(`${base}/links`, { method: 'POST', body: JSON.stringify(body) });
  const { code } = await (await post({ url: 'https://example.com' })).json();
  const r = await fetch(`${base}/${code}`, { redirect: 'manual' });
  assert.equal(r.status, 302);
  for (let i = 0; i < 4; i++) await post({ url: 'https://example.com' });
  assert.equal((await post({ url: 'https://example.com' })).status, 429);
  t = 61_000;
  assert.equal((await post({ url: 'https://example.com' })).status, 201);
  s.close();
});
