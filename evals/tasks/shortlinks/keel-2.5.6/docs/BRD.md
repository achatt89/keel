# Business Requirements Document
## shortlinks — a small in-memory URL-shortener HTTP service

**Version:** 0.1 (lite — prototype tier)
**Date:** 2026-11-16
**Author:** founder (spec) · Keel (structure)
**Status:** Draft — pending founder review of the `[ASSUMPTION]` rows and `docs/adr/README.md` Open decisions

---

## 1. Executive Summary

Long internal URLs are hard to share in chat and tickets. One small team wants short links and a
hit count per link, created with `curl` or a script, clicked by anyone on the team network.

**shortlinks is a single-process Node.js HTTP service that turns an absolute `http(s)` URL into a short code, redirects `GET /<code>` to it, and counts the hits.**

Example: `curl -X POST :3000/links -d '{"url":"https://wiki.internal/a/very/long/path"}'` →
`{"code":"aZ3_k9Q","url":"https://wiki.internal/a/very/long/path"}`; a teammate opens `:3000/aZ3_k9Q`
and is redirected; `GET /links/aZ3_k9Q` shows `hits: 1`.

Tier: **Prototype / weekend** (founder-confirmed). Restarting the service may lose every link; that
is accepted (RSK-001).

---

## 2. The Problem

**Long URLs do not paste well.** Internal links run to hundreds of characters and break in chat clients and tickets.

**Nobody knows whether a shared link is used.** The team has no cheap way to see if a shared document was opened.

The result: links are re-pasted, truncated, or lost, and sharing effort is not measurable.

---

## 3. Business Objectives

| ID | Objective | Success Metric | Measurement |
|----|-----------|----------------|-------------|
| BO-01 | Teammates can create and share short links in one command | `POST /links` → 201 with a working short URL | Phase 1 conformance tests |
| BO-02 | Every endpoint behaves exactly as specified, including the rate limit (founder's success criterion) | 100% of status/error codes in PRD.md §4–§6 covered by passing tests | `node --test` green; Phase 2 live curl pass |
| BO-03 | Link usage is visible | `hits` equals the number of 302 redirects served | Phase 1 hit-count tests |
| BO-04 | Creation abuse is bounded | ≤5 creations per client IP per rolling 60 s | Phase 2 fake-clock tests |

---

## 6. Business Requirements

Group prefixes: **LNK** link management · **RDR** redirect & hits · **ABU** abuse control ·
**VAL** input validation & uniform errors · **DLV** delivery. Behavioural detail and acceptance
criteria live in `PRD.md` (one fact, one home); this table is the requirement list.

### LNK — Link management

| ID | Requirement | Priority |
|----|-------------|----------|
| LNK-001 | Create a link from an absolute `http`/`https` URL via `POST /links`; respond 201 `{"code","url"}` | Must |
| LNK-002 | Accept an optional custom `code`; reject a code already in use with 409 `code_taken` | Must |
| LNK-003 | Generate a random 7-character `A-Za-z0-9` code when none is supplied | Must |
| LNK-004 | Inspect a link: `GET /links/<code>` → `{code,url,hits,createdAt}` (ISO 8601) | Must |
| LNK-005 | Delete a link: `DELETE /links/<code>` → 204 | Must |

### RDR — Redirect & hits

| ID | Requirement | Priority |
|----|-------------|----------|
| RDR-001 | `GET /<code>` → 302 with `Location` = the stored URL | Must |
| RDR-002 | Each redirect counts exactly one hit | Must |

### ABU — Abuse control

| ID | Requirement | Priority |
|----|-------------|----------|
| ABU-001 | Each client IP may create at most 5 links in any rolling 60-second window | Must |
| ABU-002 | The sixth creation is 429 `rate_limited` with `Retry-After` = whole seconds until a slot frees, ≥ 1 | Must |

### VAL — Input validation & errors

| ID | Requirement | Priority |
|----|-------------|----------|
| VAL-001 | `url`: absolute, scheme `http` or `https`, ≤ 2048 characters, else 400 `invalid_url` | Must |
| VAL-002 | `code`: 4–16 characters from `A-Z a-z 0-9 _ -`, else 400 `invalid_code` | Must |
| VAL-003 | Body that is not valid JSON → 400 `invalid_json` | Must |
| VAL-004 | Every error body is exactly `{"error":"<code>"}` | Must |
| VAL-005 | Unknown path or code → 404 `not_found`; known path, wrong method → 405 `method_not_allowed` | Must |

### DLV — Delivery

| ID | Requirement | Priority |
|----|-------------|----------|
| DLV-001 | Own tests runnable with `node --test` | Must |
| DLV-002 | README explains how to run the service and the tests | Must |
| DLV-003 | `node src/main.js` listens on `PORT` (default 3000) | Must |

> There is no SEC group: the founder's security answer is "validate every input, http(s) only, the
> rate limit is the abuse control" — those are VAL-001/002/003 and ABU-001/002. Residual security
> risks are RSK-003..RSK-005.

---

## 7. Constraints

| ID | Constraint | Explicit Impact on Technical Decisions |
|----|-----------|----------------------------------------|
| CON-001 | Node.js 20 or later | No syntax/APIs newer than Node 20 LTS; `node:test` is available |
| CON-002 | Standard library only — no npm dependencies, no frameworks | Routing, JSON, validation, rate limiting are hand-written (ADR-001) |
| CON-003 | In-memory storage; no database | State dies with the process; single instance only (RSK-001) |
| CON-004 | `src/server.js` exports `createServer(options)` returning a non-listening `node:http` Server; `options.now` optional (default `Date.now`) | All time reads go through `options.now`; each call builds independent state (ADR-001, ADR-002) |
| CON-005 | One developer machine or one small VM behind the team VPN; `node src/main.js`; no container, no CI deploy | No DEPLOYMENT doc; no TLS or auth in-process (RSK-003) |
| CON-006 | Client IPs are the only personal data, held in memory for rate limiting only | Not persisted, not logged by default (ADR-003); no COMPLIANCE doc |

---

## 8. Assumptions

| ID | Assumption |
|----|-----------|
| A-01 | `[ASSUMPTION]` Audience is one small team on a trusted network; anyone who can reach the port may create, read and delete any link (no auth). |
| A-02 | `[ASSUMPTION]` Clients connect directly (no reverse proxy), so `socket.remoteAddress` is the client IP (ADR-003). |
| A-03 | `[ASSUMPTION]` Traffic is tiny (a team): no throughput, latency or memory targets beyond "does not leak per request". |
| A-04 | `[ASSUMPTION]` Only successful creations consume rate-limit slots (ADR-002). |
| A-05 | `[ASSUMPTION]` Edge-case behaviours not fixed by the founder's spec follow PRD.md §7 / ADR-004 / ADR-005 until the founder overrides them. |
| A-06 | `[ASSUMPTION]` Git workflow defaults: branch-per-phase off `main`, parallel agents in worktrees, doc-sync after each phase; bounded-retries exit strategy; default byte budgets. |

---

## 9. Success Metrics

| Metric | Target | How Measured |
|--------|--------|-------------|
| Spec conformance | Every status code and error code in PRD.md §4–§6 has a passing test | `node --test`; Phase 2 live curl transcript |
| Rate-limit exactness | 6th creation in 60 s → 429; `Retry-After` correct at every tested offset; slot frees at exactly +60 s | Fake-clock tests |
| No third-party code | `dependencies`/`devDependencies` absent; `src/` imports only `node:` modules | Guardrail test (Phase 0) |

---

## 10. Out of Scope — v1

- UI of any kind; accounts, authentication, per-user link ownership.
- Persistence (database, file snapshot); multi-instance or shared rate-limit state.
- Link expiry, editing, listing/search, analytics beyond one `hits` counter.
- TLS termination, reverse-proxy / `X-Forwarded-For` support, container image, CI deploy.
- Malicious-URL scanning, custom domains.

---

## 11. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|----|------|-----------|--------|-----------|-------|
| RSK-001 | Restart loses all links and hit counts | High | Low | **Accepted residual risk** (founder, CON-003). Revisit: the team starts relying on links being permanent | founder |
| RSK-002 | Unbounded memory: links are never evicted and creation is limited only per IP | Low | Med | Per-IP limit; 2048-char URL cap; body cap (ADR-004); expired limiter entries pruned (ADR-002). **Accepted residual risk**; revisit: process memory growth observed | engineering |
| RSK-003 | No auth: any reachable client can read stats for, or delete, any link | Med | Med | **Accepted residual risk** (A-01): service sits behind the team VPN. Revisit: exposed beyond the VPN or a link is deleted by mistake | founder |
| RSK-004 | Rate limit keyed on socket IP: behind a proxy all users share one bucket; a client with many IPs evades it | Low | Low | Documented; `X-Forwarded-For` deliberately ignored because it is spoofable (ADR-003). Revisit: a reverse proxy is introduced | engineering |
| RSK-005 | Service can be used to redirect to arbitrary http(s) URLs (phishing relay inside the team) | Low | Med | Scheme allow-list only; trusted-network audience (A-01). **Accepted residual risk**; revisit: service becomes reachable by untrusted users | founder |
| RSK-006 | Rate-limit state is per-process and lost on restart: a restart resets every client's window | Low | Low | **Accepted residual risk** (follows from CON-003) | engineering |

---

## 13. Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| Node.js ≥ 20 | Runtime | `node:http`, `node:test`, `node:crypto`, `node:assert` only |

---

*End of BRD 0.1 — shortlinks*
