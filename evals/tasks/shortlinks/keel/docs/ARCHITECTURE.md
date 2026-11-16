# shortlinks — Architecture (lite)

**Status:** 🔄 Draft v0.1 · Contract: [PRD.md](./PRD.md) · Decisions: [adr/README.md](./adr/README.md)

## 1. Principles

| ID | Principle | Why |
|---|---|---|
| P-01 | Standard library only; no dependency, no framework | CON-01, [ADR-001](./adr/ADR-001-stdlib-only-http.md) |
| P-02 | `createServer(options)` is a pure factory: each call owns its own store and limiter; nothing listens until the caller says so | RUN-002; isolates tests |
| P-03 | All time comes from `options.now`; no module calls `Date.now()` directly | Deterministic rate-limit and `createdAt` tests |
| P-04 | Every response leaves through one JSON helper; errors only through the error module | RTE-001 |
| P-05 | Validate at the edge, before touching state | SEC-001 |

## 2. Components

| Component | File | Owns |
|---|---|---|
| Entry point | `src/main.js` | Reads `PORT` (default 3000), calls `createServer()`, `listen` |
| Server + router | `src/server.js` | `createServer(options)`, path/method matching, body reading, handlers, the 404/405 matrix ([ADR-004](./adr/ADR-004-routing-and-reserved-code.md)) |
| Validation | `src/validate.js` | `url` and `code` rules (PRD §3.1) |
| Store | `src/store.js` | `Map<code, {code,url,hits,createdAt}>`; create / get / hit / delete; random code generation ([ADR-002](./adr/ADR-002-in-memory-store.md)) |
| Rate limiter | `src/rate-limit.js` | Per-IP rolling-window log ([ADR-003](./adr/ADR-003-rate-limit-sliding-window.md)) |
| Errors | `src/errors.js` | `ApiError(status, code)` and the envelope writer |
| Tests | `test/*.test.js` | `node:test` suites driving `createServer` on an ephemeral port |

## 3. Interfaces (module contracts)

| Module | Exports | Notes |
|---|---|---|
| `validate` | `validateUrl(v)`, `validateCode(v)` → throw `ApiError(400,…)` | URL via `new URL`; protocol check; length ≤ 2048 |
| `store` | `createStore({now})` → `{create(url, code?), get(code), hit(code), remove(code), has(code)}` | `create` throws `ApiError(409,'code_taken')` for a used or reserved code |
| `rate-limit` | `createRateLimiter({now, limit=5, windowMs=60000})` → `{check(ip)`→`{ok}` or `{ok:false,retryAfter}`, `record(ip)}` | `check` then `record` only after a successful create (PRD §3.6) |
| `errors` | `ApiError`, `sendJson(res,status,body)`, `sendError(res,err)` | One serialiser for all errors |

## 4. Data model

| Entity | Fields | Lifetime |
|---|---|---|
| Link | `code` (key), `url`, `hits` (int), `createdAt` (ms, from `now`) | Until deleted or process exit |
| IP window | `ip → number[]` (ms timestamps of counted creations, oldest first) | Entries older than 60 s are dropped on each check; empty IPs are removed |

## 5. Request flow (`POST /links`)

1. Route → `/links` + `POST`. 2. Read body (≤64 KiB), parse JSON → `invalid_json`. 3. `validateUrl`, then `validateCode` if present. 4. `limiter.check(ip)` → 429 + `Retry-After`. 5. `store.create` → 409 if taken. 6. `limiter.record(ip)`. 7. 201 `{code,url}`.

`GET /<code>`: route → `store.hit(code)` → 302 `Location`. No body is read for `GET`/`DELETE`.

## 6. Trust boundaries & security controls

One boundary: the HTTP socket (VPN-only, unauthenticated). Untrusted input = request line, path, headers, body.

| Concern | Control |
|---|---|
| Open redirect / scheme abuse | Only `http`/`https` URLs are stored; the `Location` is never built from request data other than the stored url |
| Header injection via `Location` | `new URL` parse rejects control characters; stored url must parse; a url that `setHeader` rejects yields 500 not a split response |
| Oversize / malformed body | 64 KiB cap, JSON parse errors → `invalid_json` |
| Creation abuse | Rate limit (F-07); the only abuse control by founder decision |
| Prototype pollution / key collision | Store is a `Map`, never a plain object keyed by user input |
| Memory growth | IP windows pruned on access; link count uncapped (RSK-001) |

## 7. Accepted residual risks

| ID | Risk | Revisit trigger |
|---|---|---|
| RSK-002 | Anyone reaching the port can create/delete any link | Network is no longer the team VPN |
| RSK-004 | Restart loses all links | Links need to outlive a restart |

## 8. Observability

None in v1: no request logging (keeps client IPs out of logs), no metrics. `[ASSUMPTION]` A failing request is diagnosed by reproducing it with `curl`.
