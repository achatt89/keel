# Architecture — shortlinks (lite)

**Version:** 0.1 · **Date:** 2026-11-16 · **Status:** Draft · Prototype-tier: principles, components, flow, security note, accepted risks.
Requirements: `BRD.md` §6 · Contract: `PRD.md` · Decisions: `adr/README.md`.

## 1. Principles

| ID | Principle | Basis |
|---|---|---|
| P-01 | Standard library only: `node:http`, `node:crypto`, `node:test`, `node:assert`. No dependency, no framework. | CON-002, ADR-001 |
| P-02 | `createServer(options)` is a pure factory: it returns a non-listening `http.Server` and owns all state in closures. Two calls share nothing. | CON-004, ADR-001 |
| P-03 | Time enters only through `options.now`. No other `Date.now()`/`new Date()` call in `src/`. | CON-004, ADR-002 |
| P-04 | One error path: every error response is produced by one helper that writes `{"error":"<code>"}`. | VAL-004 |
| P-05 | Validate before acting: parse, validate, rate-check, then mutate — the store changes only after every check passes. | VAL-001..003, ADR-004 |

## 2. Components

CommonJS modules (ADR-001). Layout is a recommendation; module boundaries and the invariants matter, filenames do not.

| Component | File | Responsibility | Owns |
|---|---|---|---|
| Entry point | `src/main.js` | Read/validate `PORT`, `createServer().listen(PORT)`, log the port | process lifecycle |
| Server factory + router | `src/server.js` | `createServer(options)`; path-shape routing (404/405); body read with size cap; handler dispatch; 500 catch-all | request lifecycle |
| Error helper | `src/errors.js` | `sendError(res, status, code)` — the only writer of error bodies | error format |
| Validators | `src/validate.js` | `validateUrl`, `validateCode` (pure, no I/O) | PRD §5 rules |
| Store | `src/store.js` | In-memory `Map<code, {url, hits, createdAt}>`; `create/get/delete/hit`; random code generation | link state |
| Rate limiter | `src/rate-limiter.js` | Sliding-window log per IP: `tryAcquire(ip, now) → {ok} \| {ok:false, retryAfter}` | limiter state |
| Tests | `test/` | `node:test` suites + helpers (ephemeral-port server, fake clock) | — |

## 3. Data flow — `POST /links`

```
client ─HTTP─▶ server.js: route by path shape ──404/405──▶ errors.js
                 │ POST /links
                 ▼ read body (cap 16 KiB, else 413)
               JSON.parse ──fail──▶ 400 invalid_json
                 ▼
               validate.js url ──fail──▶ 400 invalid_url
               validate.js code (if present) ──fail──▶ 400 invalid_code
                 ▼  ── synchronous from here: no await between check and write ──
               rate-limiter.tryAcquire(ip, now()) ──full──▶ 429 + Retry-After
               store: code in use or "links"? ──▶ 409 code_taken
               rate-limiter.record + store.create(code, url, now()) ─▶ 201 {code,url}
```

Redirect: route → `store.get(code)` → miss: 404; hit: `store.hit(code)`, `302` + `Location` + `Cache-Control: no-store`.
The limiter acquire-and-record and the store write are one synchronous step, so concurrent requests cannot both take the last slot or the same code.

## 4. Data model (in memory)

| Structure | Shape | Lifetime |
|---|---|---|
| links | `Map<string, { url: string, hits: number, createdAt: number /*ms from options.now*/ }>` | process; deleted on `DELETE` |
| rate windows | `Map<string /*IP*/, number[] /*creation times, ascending*/>` | entry removed when its array empties after pruning (ADR-002) |

Client IPs exist only in the rate-window map: never persisted, never logged (CON-006).

## 5. Security and abuse controls (prototype-scale)

| Threat | Control | Ref |
|---|---|---|
| Malformed/hostile input | Every field validated; unknown shapes → 400; body capped | VAL-001..003, ADR-004 |
| `javascript:`/`data:`/`file:` redirects | Scheme allow-list `http`/`https` | VAL-001 |
| Response splitting / bad `Location` | Printable-ASCII-only URLs (no CR/LF/whitespace/non-ASCII) | PRD §5, OD-01 |
| Creation spam / memory growth | Per-IP limit 5/60 s; 2048-char URLs; 16 KiB body cap | ABU-001, RSK-002 |
| Spoofed client IP via headers | `X-Forwarded-For` ignored; key = socket peer | ADR-003 |
| Information leakage in errors | Fixed error codes only; no stack traces or messages in bodies | P-04 |
| Route shadowing (`/links` as a code) | `links` reserved | ADR-005 |
| Predictable codes | Random codes from `crypto.randomInt` | ADR-001 |
| No authentication | Accepted; VPN-only deployment | RSK-003 |

## 6. Observability

`main.js` logs one line on start (`listening on <port>`). No request logging by default (keeps IPs out of logs). Revisit when the service is used beyond one team.

## 7. Accepted residual risks

Mirrors `BRD.md` §11: RSK-001 (restart loses data), RSK-002 (unbounded links), RSK-003 (no auth), RSK-004 (IP identity limits), RSK-005 (redirect relay), RSK-006 (limiter resets on restart). Revisit triggers are in the BRD rows. Threat modelling at prototype tier was a single pass over the generated docs (table in §5); no `THREAT_MODEL.md` — trigger to add one: the service is reachable by untrusted users.
