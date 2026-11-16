import http from 'node:http';
import { randomInt } from 'node:crypto';

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const CODE = /^[A-Za-z0-9_-]{4,16}$/;
const WINDOW = 60_000, LIMIT = 5;

class HttpError extends Error { constructor(status, code) { super(code); this.status = status; } }

function validUrl(s) {
  if (typeof s !== 'string' || s.length > 2048) return false;
  try { return ['http:', 'https:'].includes(new URL(s).protocol); } catch { return false; }
}

async function readJson(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  try { return JSON.parse(body); } catch { throw new HttpError(400, 'invalid_json'); }
}

export function createServer({ now = Date.now } = {}) {
  const links = new Map();
  const creates = new Map(); // ip -> timestamps in the window

  function rateLimit(ip) {
    const t = now();
    const recent = (creates.get(ip) ?? []).filter((s) => s > t - WINDOW);
    creates.set(ip, recent);
    if (recent.length >= LIMIT) return Math.max(1, Math.ceil((recent[0] + WINDOW - t) / 1000));
    recent.push(t);
    return 0;
  }

  async function handle(req, res) {
    const path = new URL(req.url, 'http://x').pathname;
    const send = (status, body, headers = {}) => {
      res.writeHead(status, body === undefined ? headers : { 'content-type': 'application/json', ...headers });
      res.end(body === undefined ? undefined : JSON.stringify(body));
    };
    if (path === '/links') {
      if (req.method !== 'POST') throw new HttpError(405, 'method_not_allowed');
      const body = await readJson(req);
      if (!validUrl(body?.url)) throw new HttpError(400, 'invalid_url');
      let code = body.code;
      if (code !== undefined) {
        if (typeof code !== 'string' || !CODE.test(code)) throw new HttpError(400, 'invalid_code');
        if (links.has(code)) throw new HttpError(409, 'code_taken');
      }
      const wait = rateLimit(req.socket.remoteAddress);
      if (wait) return send(429, { error: 'rate_limited' }, { 'retry-after': String(wait) });
      while (code === undefined || links.has(code)) code = Array.from({ length: 7 }, () => ALPHA[randomInt(ALPHA.length)]).join('');
      links.set(code, { code, url: body.url, hits: 0, createdAt: new Date(now()).toISOString() });
      return send(201, { code, url: body.url });
    }
    const m = /^\/links\/([^/]+)$/.exec(path) ?? /^\/([^/]+)$/.exec(path);
    const link = m && links.get(decodeURIComponent(m[1]));
    const isInfo = path.startsWith('/links/');
    if (!m) throw new HttpError(404, 'not_found');
    const allowed = isInfo ? ['GET', 'DELETE'] : ['GET'];
    if (!allowed.includes(req.method)) throw new HttpError(405, 'method_not_allowed');
    if (!link) throw new HttpError(404, 'not_found');
    if (!isInfo) { link.hits++; return send(302, undefined, { location: link.url }); }
    if (req.method === 'DELETE') { links.delete(link.code); return send(204); }
    return send(200, link);
  }

  return http.createServer((req, res) => {
    handle(req, res).catch((e) => {
      const status = e instanceof HttpError ? e.status : 500;
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: e instanceof HttpError ? e.message : 'internal' }));
    });
  });
}
