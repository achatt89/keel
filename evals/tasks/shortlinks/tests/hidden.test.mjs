// Hidden acceptance tests. The agent never sees these. SUBMISSION = the agent's project folder.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const { createServer } = await import(pathToFileURL(join(process.env.SUBMISSION, 'src/server.js')));
const servers = [];
after(() => servers.forEach((s) => s.close()));
async function svc() {
  const clock = { t: 1_700_000_000_000 };
  const s = createServer({ now: () => clock.t });
  await new Promise((r) => s.listen(0, '127.0.0.1', r));
  servers.push(s);
  const base = `http://127.0.0.1:${s.address().port}`;
  const req = async (method, path, body) => {
    const r = await fetch(base + path, { method, redirect: 'manual', body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body), headers: { 'content-type': 'application/json' } });
    const text = await r.text();
    let json; try { json = JSON.parse(text); } catch {}
    return { status: r.status, json, text, headers: r.headers };
  };
  return { clock, req };
}

test('create with generated code, redirect, stats', async () => {
  const { req } = await svc();
  const c = await req('POST', '/links', { url: 'https://example.com/a?b=1' });
  assert.equal(c.status, 201);
  assert.match(c.json.code, /^[A-Za-z0-9]{7}$/);
  assert.equal(c.json.url, 'https://example.com/a?b=1');
  const g = await req('GET', `/${c.json.code}`);
  assert.equal(g.status, 302);
  assert.equal(g.headers.get('location'), 'https://example.com/a?b=1');
  await req('GET', `/${c.json.code}`);
  const s = await req('GET', `/links/${c.json.code}`);
  assert.equal(s.status, 200);
  assert.equal(s.json.hits, 2);
  assert.equal(s.json.code, c.json.code);
  assert.ok(!Number.isNaN(Date.parse(s.json.createdAt)) && /T.*Z$/.test(s.json.createdAt));
});

test('custom code: valid, taken, invalid', async () => {
  const { req } = await svc();
  assert.equal((await req('POST', '/links', { url: 'http://a.example', code: 'my_link-1' })).status, 201);
  const t = await req('POST', '/links', { url: 'http://b.example', code: 'my_link-1' });
  assert.deepEqual([t.status, t.json], [409, { error: 'code_taken' }]);
  for (const code of ['abc', 'a'.repeat(17), 'bad code', 'é1234']) {
    const r = await req('POST', '/links', { url: 'http://a.example', code });
    assert.deepEqual([r.status, r.json], [400, { error: 'invalid_code' }], code);
  }
});

test('url validation', async () => {
  const { req } = await svc();
  for (const url of ['javascript:alert(1)', 'ftp://x.example/f', 'example.com', '', 'https://x.example/' + 'a'.repeat(2048), 42]) {
    const r = await req('POST', '/links', { url });
    assert.deepEqual([r.status, r.json], [400, { error: 'invalid_url' }], String(url).slice(0, 40));
  }
  assert.equal((await req('POST', '/links', { url: 'https://x.example/' + 'a'.repeat(2048 - 18) })).status, 201);
});

test('bad JSON is 400 and the server keeps serving', async () => {
  const { req } = await svc();
  const r = await req('POST', '/links', '{nope');
  assert.deepEqual([r.status, r.json], [400, { error: 'invalid_json' }]);
  assert.equal((await req('POST', '/links', { url: 'https://ok.example' })).status, 201);
});

test('404, 405, delete', async () => {
  const { req } = await svc();
  assert.deepEqual([(await req('GET', '/nope123')).status, (await req('GET', '/nope123')).json], [404, { error: 'not_found' }]);
  assert.deepEqual((await req('GET', '/links/nope123')).json, { error: 'not_found' });
  assert.equal((await req('GET', '/a/b/c')).status, 404);
  const m = await req('GET', '/links');
  assert.deepEqual([m.status, m.json], [405, { error: 'method_not_allowed' }]);
  const { json } = await req('POST', '/links', { url: 'https://d.example' });
  const d = await req('DELETE', `/links/${json.code}`);
  assert.equal(d.status, 204);
  assert.equal(d.text, '');
  assert.equal((await req('GET', `/${json.code}`)).status, 404);
  assert.equal((await req('DELETE', `/links/${json.code}`)).status, 404);
});

test('rate limit: rolling 60s window with Retry-After', async () => {
  const { req, clock } = await svc();
  const make = () => req('POST', '/links', { url: 'https://r.example' });
  const t0 = clock.t - (clock.t % 60_000) + 50_000; // 10s before a minute boundary
  clock.t = t0;
  for (let i = 0; i < 3; i++) assert.equal((await make()).status, 201);
  clock.t = t0 + 5_000;
  for (let i = 0; i < 2; i++) assert.equal((await make()).status, 201);
  clock.t = t0 + 20_000; // past the minute boundary: a fixed bucket would reset here
  const r = await make();
  assert.deepEqual([r.status, r.json], [429, { error: 'rate_limited' }]);
  assert.equal(r.headers.get('retry-after'), '40');
  clock.t = t0 + 60_001; // first three expired
  for (let i = 0; i < 3; i++) assert.equal((await make()).status, 201);
  assert.equal((await make()).status, 429);
});
