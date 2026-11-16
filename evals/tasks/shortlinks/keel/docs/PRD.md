# shortlinks — Product Requirements (API contract)

**Status:** 🔄 Draft v0.1 · Requirements: [BRD.md](./BRD.md) · Design: [ARCHITECTURE.md](./ARCHITECTURE.md) · Plan: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

The product is a JSON HTTP API; this file is its contract. Lines marked **[ASSUMPTION]** are not in the founder's spec: each is a default the tests pin, tracked in [adr/README.md](./adr/README.md) Open decisions.

## 1. Personas & journeys

| Persona | Journey |
|---|---|
| Teammate | `POST /links` with a long URL → gets `code` → shares `http://host:3000/<code>` → later `GET /links/<code>` to read hits → `DELETE` when stale |
| Clicker | Opens `/<code>` → browser follows the 302 |

## 2. Features

| ID | Feature | Pri | Implements | Phase |
|---|---|---|---|---|
| F-01 | Create link | Must | LNK-001..003, SEC-001 | 0 |
| F-02 | Redirect + count hit | Must | LNK-004 | 0 |
| F-03 | Link details | Must | LNK-005 | 0 |
| F-04 | Delete link | Must | LNK-006 | 0 |
| F-05 | Error envelope | Must | RTE-001 | 0 |
| F-06 | 404 / 405 routing | Must | RTE-002 | 0 |
| F-07 | Creation rate limit | Must | RAT-001, RAT-002, SEC-001 | 1 |
| F-08 | Service shell (`createServer`, `main.js`, `PORT`) | Must | RUN-001..003 | 0 |
| F-09 | Tests + README | Must | RUN-004 | 0–1 |

## 3. Endpoint contract

All bodies are JSON (`Content-Type: application/json`). Every error body is exactly `{"error":"<code>"}`.

| Method · Path | Success | Errors |
|---|---|---|
| `POST /links` | 201 `{"code","url"}` | 400 `invalid_json` · 400 `invalid_url` · 400 `invalid_code` · 409 `code_taken` · 429 `rate_limited` |
| `GET /<code>` | 302, `Location: <url>`, hit +1 | 404 `not_found` |
| `GET /links/<code>` | 200 `{"code","url","hits","createdAt"}` | 404 `not_found` |
| `DELETE /links/<code>` | 204, no body | 404 `not_found` |
| any other path | — | 404 `not_found` |
| known path, wrong method | — | 405 `method_not_allowed` |

### 3.1 F-01 Create (`POST /links`)

Body `{"url": "...", "code": "..."}`; `code` optional.

| Rule | Behaviour |
|---|---|
| `url` | Must be a string, parse as an absolute URL, protocol `http:` or `https:`, length ≤ 2048 characters; else 400 `invalid_url`. Missing or non-string `url` is `invalid_url` **[ASSUMPTION]** |
| `code` (custom) | 4–16 chars from `A-Z a-z 0-9 _ -`; else 400 `invalid_code`. Present but not a string (including `null`) is `invalid_code` **[ASSUMPTION]** |
| Taken code | 409 `code_taken` |
| Reserved code | `links` is taken by the `/links` route and is answered 409 `code_taken` **[ASSUMPTION]**, [ADR-004](./adr/ADR-004-routing-and-reserved-code.md) |
| No code | Random 7 chars from `A-Za-z0-9`, drawn with `node:crypto`; redraw on collision |
| Body | Not valid JSON → 400 `invalid_json`. Valid JSON that is not an object → `invalid_url` **[ASSUMPTION]**. Body over 64 KiB → 400 `invalid_json` **[ASSUMPTION]** |
| Response | 201 `{"code","url"}`; `url` is echoed exactly as submitted (no normalisation) so `Location` equals it |
| Check order | JSON → `url` → `code` format → rate limit → code taken → create. See F-07 |

### 3.2 F-02 Redirect (`GET /<code>`)

302 with `Location` = stored url; increments `hits` by exactly one per request. Unknown code → 404 `not_found`. Codes are case-sensitive. Path segments are matched literally (no percent-decoding) **[ASSUMPTION]**.

### 3.3 F-03 Details (`GET /links/<code>`)

200 `{"code","url","hits","createdAt"}`; `hits` is an integer; `createdAt` is `new Date(now()).toISOString()` captured at creation. Reading details does not count a hit.

### 3.4 F-04 Delete (`DELETE /links/<code>`)

204 with an empty body. The code is free to reuse afterwards. Deleting does not refund rate-limit slots.

### 3.5 F-06 Routing

| Path shape | Allowed methods | Other methods |
|---|---|---|
| `/links` | `POST` | 405 |
| `/links/<code>` | `GET`, `DELETE` | 405 |
| `/<code>` (one segment of `A-Za-z0-9_-`) | `GET` | 405 **[ASSUMPTION]**: any such path is "known", whether or not the code exists; `HEAD` is a wrong method |
| anything else (`/`, `/a/b/c`, `/a.b`, trailing slash, empty `<code>`) | — | 404 `not_found` |

The query string is ignored when routing. 405 responses carry an `Allow` header **[ASSUMPTION]**.

### 3.6 F-07 Rate limit

| Rule | Behaviour |
|---|---|
| Scope | Per client IP; only `POST /links` |
| Limit | At most 5 creations in any rolling 60 000 ms window; the 6th is 429 `rate_limited` |
| What counts | A creation that succeeded (201). Requests rejected with 400 or 409 do not consume a slot **[ASSUMPTION]**, [ADR-003](./adr/ADR-003-rate-limit-sliding-window.md) |
| `Retry-After` | `max(1, ceil((oldestCountedAt + 60000 − now) / 1000))` whole seconds |
| Client IP | Socket remote address, IPv4-mapped IPv6 normalised to IPv4; `X-Forwarded-For` ignored (BRD A-02) |
| Clock | All time reads go through `options.now` |

### 3.7 F-08 Service shell

`require('./src/server.js').createServer(options)` returns a `node:http` Server that is not listening. `options.now` is optional (default `Date.now`). `node src/main.js` listens on `process.env.PORT` or 3000.

### 3.8 F-05 Error envelope

One helper serialises every error as `{"error":"<code>"}` with `Content-Type: application/json`. Codes: `invalid_json` `invalid_url` `invalid_code` `code_taken` `not_found` `method_not_allowed` `rate_limited`. Unexpected exceptions return 500 `{"error":"internal_error"}` **[ASSUMPTION]**.

## 4. Non-goals

See [BRD.md §7](./BRD.md#7-out-of-scope-wont-v1).
