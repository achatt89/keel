# Product Requirements — shortlinks

**Version:** 0.1 · **Date:** 2026-11-16 · **Status:** Draft
**Home of:** the HTTP contract. Lines marked **[FOUNDER]** are the founder's spec verbatim (confirmed
requirements). Lines marked `[ASSUMPTION]` are Keel defaults for what the spec leaves open — they
are implemented as written until the founder overrides them (`docs/adr/README.md` "Open decisions").
Requirement IDs: `BRD.md` §6.

> Why a PRD at prototype tier: the API contract needs exactly one home with testable acceptance
> criteria; the founder's success criterion is "every endpoint behaves exactly as specified".

## 1. Users

| Persona | Does | Interface |
|---|---|---|
| **Link creator** — teammate | Creates links, reads hit counts, deletes links | `curl` / scripts → JSON API |
| **Link follower** — anyone who clicks | Opens `/<code>` and lands on the target | Browser / any HTTP client |

No UI, no accounts (BRD §10).

## 2. Features

| ID | Feature | Satisfies | Priority | Phase |
|---|---|---|---|---|
| F-01 | Create link (`POST /links`) with optional custom code | LNK-001..003, VAL-001..003 | Must | 1 |
| F-02 | Redirect (`GET /<code>`) with hit counting | RDR-001, RDR-002 | Must | 1 |
| F-03 | Inspect link (`GET /links/<code>`) | LNK-004 | Must | 1 |
| F-04 | Delete link (`DELETE /links/<code>`) | LNK-005 | Must | 1 |
| F-05 | Uniform errors and routing (404/405) | VAL-004, VAL-005 | Must | 0 |
| F-06 | Per-IP creation rate limit | ABU-001, ABU-002 | Must | 2 |
| F-07 | Entry point and exported factory | DLV-003, CON-004 | Must | 0 |
| F-08 | Tests and README | DLV-001, DLV-002 | Must | 0–2 |

## 3. Conventions

- **[FOUNDER]** JSON in and out. Every error body is `{"error":"<code>"}`.
- `[ASSUMPTION]` JSON responses carry `Content-Type: application/json; charset=utf-8`. `204` and `302` have no body.
- `[ASSUMPTION]` Codes are case-sensitive. Query strings are ignored for routing. Paths are not percent-decoded.
- `[ASSUMPTION]` Codes and URLs are stored exactly as given; the `url` echoed in responses and used in `Location` is the string the client sent.
- Error codes: `invalid_url` · `invalid_code` · `invalid_json` · `code_taken` · `not_found` · `method_not_allowed` · `rate_limited` (all **[FOUNDER]**) · `payload_too_large` `[ASSUMPTION]` (ADR-004).

## 4. Routing and endpoints

Path shape decides 404 vs 405 *before* any lookup (`[ASSUMPTION]`, ADR-005).

| Path shape | Allowed | Other methods | Notes |
|---|---|---|---|
| `/links` | `POST` | 405 | create |
| `/links/<code>` | `GET`, `DELETE` | 405 | `<code>` = one non-empty segment |
| `/<code>` (single non-empty segment, not `links`) | `GET` | 405 | redirect |
| anything else (`/`, `/links/`, `/a/b`, `/links/a/b`) | — | **404** `not_found` | |

| Request | Success | Errors |
|---|---|---|
| `POST /links` | **201** `{"code","url"}` | 400 `invalid_json` / `invalid_url` / `invalid_code` · 409 `code_taken` · 429 `rate_limited` (+`Retry-After`) · 413 `payload_too_large` |
| `GET /<code>` | **302**, `Location: <url>`, one hit counted | 404 `not_found` (unknown code, no hit) |
| `GET /links/<code>` | **200** `{"code","url","hits","createdAt"}` — `createdAt` ISO 8601 (`new Date(now()).toISOString()`) | 404 `not_found` |
| `DELETE /links/<code>` | **204**, empty body | 404 `not_found` |

Acceptance criteria:

- **F-02** A hit is counted only when a 302 is served. `GET /links/<code>`, 404s and failed creations never count. `[ASSUMPTION]` redirect carries `Cache-Control: no-store` so clients re-hit the service.
- **F-03** `hits` is an integer ≥ 0; a freshly created link has `hits: 0`.
- **F-04** After `DELETE`, `GET /<code>` and `GET /links/<code>` are 404, and the code may be created again (fresh `hits`, fresh `createdAt`). Deleting does not free a rate-limit slot (§6).
- **F-05** Every non-2xx/3xx response in this table, including unexpected internal errors (`500` `internal_error` `[ASSUMPTION]`), uses `{"error":"<code>"}` via a single helper.
- **F-07** `createServer()` with no argument works; each call has independent state; the returned server is not listening.

## 5. `POST /links` — validation

Order of checks (ADR-004): body size → JSON parse → `url` → `code` → rate limit → `code_taken` → create.
The first failing check wins.

| Field | Rule | Failure |
|---|---|---|
| body | **[FOUNDER]** must be valid JSON; empty body is not valid JSON | 400 `invalid_json` |
| body shape | `[ASSUMPTION]` valid JSON that is not an object (`[]`, `"x"`, `null`, `1`) has no `url` | 400 `invalid_url` |
| `url` | **[FOUNDER]** present, string, absolute, scheme `http` or `https`, length ≤ 2048 | 400 `invalid_url` |
| `url` (hardening) | `[ASSUMPTION]` parses with `new URL()` *and* consists only of printable ASCII (`0x21`–`0x7E`) — no whitespace, control or non-ASCII characters, so `Location` can never be malformed or header-injected; IRIs must be percent-encoded (OD-01) | 400 `invalid_url` |
| `code` | **[FOUNDER]** optional; if present: string of 4–16 characters from `A-Z a-z 0-9 _ -` | 400 `invalid_code` |
| `code` (shape) | `[ASSUMPTION]` only an absent/`undefined` `code` means "generate"; `null`, `""`, numbers → `invalid_code` | 400 `invalid_code` |
| `code` (reserved) | `[ASSUMPTION]` `links` is reserved by the route `/links` (a link at `/links` could never be reached); treated as already used | 409 `code_taken` |
| `code` (used) | **[FOUNDER]** already stored | 409 `code_taken` |
| no `code` | **[FOUNDER]** random 7 characters from `A-Z a-z 0-9`, from a CSPRNG; on collision with a stored code, draw again | — |

Boundaries to test: url length 2048 ok / 2049 → `invalid_url`; code length 3 / 4 / 16 / 17; `ftp:`, `javascript:`,
`//host/path`, `/relative`, `example.com`, `HTTP://Example.com` (scheme is case-insensitive → valid).

## 6. Rate limit (ABU-001, ABU-002)

- **[FOUNDER]** Each client IP may create at most 5 links in any rolling 60-second window; the sixth is 429 `rate_limited` with `Retry-After`: whole seconds until a slot frees, at least 1.
- Window: a creation at time *t* occupies a slot during `[t, t+60000)`; it frees at exactly `t+60000` ms (`[ASSUMPTION]`, ADR-002).
- `Retry-After` = `max(1, ceil((oldestSlotTime + 60000 − now) / 1000))`.
- Only **successful creations** consume slots; requests answered 400/409/413 do not. `DELETE` does not return a slot. Redirect/inspect/delete are not limited. (`[ASSUMPTION]`, OD-02)
- Client IP = TCP peer address, with an IPv4-mapped IPv6 address (`::ffff:1.2.3.4`) normalised to `1.2.3.4`; `X-Forwarded-For` is ignored (ADR-003).
- Time comes only from `options.now`.

Worked example (clock in ms, one IP): creations at 0, 1000, 2000, 3000, 4000 → 201. A sixth at 10 000 →
429, `Retry-After: 50` (oldest slot frees at 60 000). A sixth at 59 999 → 429, `Retry-After: 1`. At
60 000 the slot from t=0 is free → 201; a further attempt at 60 000 is then 429 with `Retry-After: 1` (the slot from t=1000 frees at 61 000).

## 7. Other edge-case decisions (all `[ASSUMPTION]`)

| Situation | Behaviour |
|---|---|
| Request body larger than 16 KiB on `POST /links` | 413 `payload_too_large` (ADR-004, OD-03) |
| `HEAD`/`OPTIONS`/`PUT`/… on a known path shape | 405 `method_not_allowed` (no `Allow` header required) |
| Unhandled exception in a handler | 500 `internal_error`; process keeps running |
| `url` with credentials (`http://u:p@host/`) | allowed (valid http URL); stored as sent |
| Link to itself or to another short link | allowed |
| Duplicate `url` with different codes | allowed — each creation is a new link |
| `PORT` not an integer 0–65535 | `main.js` prints an error and exits non-zero |

## 8. Non-goals

See `BRD.md` §10.
