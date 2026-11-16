# shortlinks — Business Requirements (lite)

**Tier:** Prototype / weekend · **Status:** 🔄 Draft v0.1 · **Source of intent:** `prompt.md` text in [`keel-transcript.md`](./keel-transcript.md) (every line is a confirmed requirement).

## 1. Problem

Long internal URLs are hard to share. One small team wants short links and hit counts, served by a service they run themselves.

## 2. Objectives

| ID | Objective | Measure |
|---|---|---|
| BO-01 | Teammates share internal URLs as short links | Links created via `curl`/script resolve with a 302 |
| BO-02 | Know how often a link is used | `hits` on `GET /links/<code>` increments once per redirect |
| BO-03 | Behave exactly as specified (the success criterion) | Every endpoint, status and error code in [`PRD.md`](./PRD.md) is covered by a `node --test` test |

## 3. Users

| User | Does | Via |
|---|---|---|
| Teammate (creator) | Creates, inspects, deletes links | `curl` or a script (JSON API) |
| Link clicker | Follows a short link | Browser or any HTTP client |

## 4. Requirements

Group prefixes: `LNK` links · `RTE` routing/errors · `RAT` rate limit · `RUN` runtime/delivery. Each is implemented by a PRD feature (`F-xx`) and built in a phase.

| ID | Requirement | Pri | PRD | Phase |
|---|---|---|---|---|
| LNK-001 | Create a link from an absolute `http`/`https` URL of ≤2048 chars | Must | F-01 | 0 |
| LNK-002 | Accept an optional custom code (4–16 chars of `A-Za-z0-9_-`); 409 if used | Must | F-01 | 0 |
| LNK-003 | Generate a random 7-char `A-Za-z0-9` code when none is given | Must | F-01 | 0 |
| LNK-004 | Redirect `GET /<code>` with 302 and count one hit | Must | F-02 | 0 |
| LNK-005 | Report `code`, `url`, `hits`, `createdAt` (ISO 8601) | Must | F-03 | 0 |
| LNK-006 | Delete a link (204, no body) | Must | F-04 | 0 |
| RTE-001 | Every error body is `{"error":"<code>"}` with the specified codes | Must | F-05 | 0 |
| RTE-002 | Unknown path → 404 `not_found`; known path, wrong method → 405 `method_not_allowed` | Must | F-06 | 0 |
| RAT-001 | Per client IP, at most 5 link creations in any rolling 60 s; the 6th is 429 `rate_limited` | Must | F-07 | 1 |
| RAT-002 | 429 carries `Retry-After`: whole seconds until a slot frees, ≥1 | Must | F-07 | 1 |
| RUN-001 | Node.js ≥20, standard library only, in-memory storage | Must | F-08 | 0 |
| RUN-002 | `createServer(options)` returns a non-listening `node:http` Server; `options.now` defaults to `Date.now` | Must | F-08 | 0 |
| RUN-003 | `node src/main.js` listens on `PORT` (default 3000) | Must | F-08 | 0 |
| RUN-004 | Own tests runnable with `node --test`; README says how to run service and tests | Must | F-09 | 0–1 |
| SEC-001 | Validate every input; only `http`/`https` URLs; the rate limit is the abuse control | Must | F-01, F-07 | 0–1 |

## 5. Constraints

| ID | Constraint |
|---|---|
| CON-01 | Node.js 20+, `node:http` only, no npm dependencies, no frameworks ([ADR-001](./adr/ADR-001-stdlib-only-http.md)) |
| CON-02 | In-memory storage only; no database ([ADR-002](./adr/ADR-002-in-memory-store.md)) |
| CON-03 | JSON API only; no UI |
| CON-04 | Runs as `node src/main.js` on one developer machine or one small VM behind the team VPN; no container, no CI deploy |
| CON-05 | One developer building with Claude Code |

## 6. Data & compliance

URLs and hit counts only. No accounts. The only personal data is client IP addresses, held in memory for rate limiting (never persisted, never logged by design). No compliance regime applies (founder answer), so no COMPLIANCE or THREAT_MODEL doc.

## 7. Out of scope (Won't, v1)

UI · accounts/auth · persistence across restarts · link expiry · editing a link · listing links · analytics beyond a hit count · custom domains · containers/CI deploy.

## 8. Assumptions

| ID | Assumption | Status |
|---|---|---|
| A-01 | Losing all links on restart is acceptable (founder: "restarting it may lose links, and that is accepted") | Confirmed |
| A-02 | [ASSUMPTION] The service sits directly on the VPN with no reverse proxy, so the client IP is the socket's remote address and `X-Forwarded-For` is ignored ([ADR-003](./adr/ADR-003-rate-limit-sliding-window.md)) | Validate |
| A-03 | [ASSUMPTION] Link and rate-limit state fit in memory for a small team's volume; no cap on link count in v1 | Validate |

## 9. Risks

| ID | Risk | Mitigation | Revisit trigger |
|---|---|---|---|
| RSK-001 | Unbounded in-memory growth (links, IP window entries) | Prune expired IP windows; accept link growth at team scale | Memory use becomes a concern |
| RSK-002 | Unauthenticated create/delete: anyone on the VPN can delete any link | Accepted for an internal prototype; rate limit covers creation only | A second team or untrusted network is added |
| RSK-003 | Spec ambiguities resolved by [ASSUMPTION] (see [adr/README.md](./adr/README.md) Open decisions) | Each is one test-pinned choice | Founder disagrees with a default |
| RSK-004 | Restart loses links and breaks shared short URLs | Accepted (A-01) | Links start to matter beyond a prototype → persistence ADR |
