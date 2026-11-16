# shortlinks — Implementation Plan

**Version:** 0.1 · **Status:** 🔄 Docs laid, no code yet
**References:** [BRD.md](./BRD.md), [PRD.md](./PRD.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [adr/README.md](./adr/README.md)

---

## How to read this plan

Two phases, ordered by one rule: **the whole contract except the rate limit first, then the limit on top of it** (the limiter plugs into an already-tested `POST /links`). Each phase lists scope, deliverables and **exit gates** that must be met before the next phase starts. Phases 0–1 deliver v1; there is no Phase 2 (BRD §7).

Two units of work exist (conventions "Two work units"): a **Phase** is a gated milestone with its own block, script and evidence file; a **Change** (`CHG-xxx`) is hotfix-weight work with a row in "Changes" and a CHANGELOG line. Phases are inserted as `N.1`, split as `N.1/N.2`; never renumbered.

### Phase status

> Updated by doc-sync (state-neutral) and the deploy step. ⬜ not started · 🔄 in progress · ✅ complete (every gate ✅ with evidence). Deploy state: `on-branch` → `merged` → `deployed vNN` → `live-verified`.

| Phase | Status | Deploy state | Exit gate (one line) | Evidence | Last update |
|---|---|---|---|---|---|
| 0 — Core API | ⬜ | — | Every endpoint and error code except the rate limit passes its `node --test` suite | — | — |
| 1 — Rate limit | ⬜ | — | 6th create in 60 s is 429 with a correct `Retry-After`; all suites green | — | — |

### Standing rules (every phase, every commit)

- **Workflow-first, branch-per-phase.** Run `claude --workflow .claude/workflows/phase-N-<slug>.js`; the script branches `phase-N-<slug>` off `main` and fans tasks out to separate `git worktree`s. Never commit to `main`.
- **Goal-directed tasks.** Each worktree agent opens with `/goal` (its completion condition). Exit strategy: **bounded retries (3), then escalate** — `/goal clear`, commit what works, add a Deferred row. [ASSUMPTION: the recommended default; not asked.]
- **Tests ship with the code.** `node --test` suites in `test/`; the behaviours in PRD §3 are proven by a test each, not asserted in prose. A test counts only once seen to fail on broken code.
- **Doc sync before merge.** Run `.claude/workflows/doc-sync.js`: AGENTS.md status, the phase table (state-neutral), `docs/adr/`, Deferred/Changes, CHANGELOG `[Unreleased]`, byte budgets.
- **Decisions captured.** A decision made mid-build becomes an ADR before the merge commit; unresolved spec gaps stay one row in `docs/adr/README.md` Open decisions.
- **Definition of done per PR:** `node --test` green · no `package.json` dependency added · doc-sync commit present.
- **Review before done.** No security or design reviewer is installed (founder declined the security skill; no UI). The caller does a `code-read` pass against `.claude/rules/service.md` instead.
- **Claims carry evidence.** `✅` needs a level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact; Verify writes `.keel/evidence/phase-N.json`; only a deploy writes `prod-live`.

---

## Phase 0 — Core API

**Goal:** a running service whose create, redirect, details and delete endpoints, 404/405 matrix and error envelope match the spec exactly, with no rate limit yet.

**Scope** (PRD §3.1–3.5, 3.7–3.8; ARCHITECTURE §2–5; ADR-001, ADR-002, ADR-004):
- `src/errors.js`, `src/validate.js`, `src/store.js`: envelope, url/code validation, random 7-char codes, `Map` store with hits and `createdAt`.
- `src/server.js`: `createServer(options)` (non-listening, `options.now` default `Date.now`), path-shape router, JSON body reading with the 64 KiB cap.
- `src/main.js`: `PORT` (default 3000).
- `test/*.test.js` and `README.md` (how to run the service and the tests).

**Deliverables:**
- [ ] `POST /links`, `GET /<code>`, `GET /links/<code>`, `DELETE /links/<code>`
- [ ] 404 / 405 matrix incl. reserved `links` (OD-01..OD-04 defaults pinned by tests)
- [ ] tests: store, validation, routing, each endpoint's success and error cases
- [ ] README

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| `node --test` green: every PRD §3 row for F-01..F-06, F-08 has a passing test | `integration` | — | — | ⬜ |
| Each error code in PRD §3.8 is produced by at least one test | `integration` | — | — | ⬜ |
| `node src/main.js` serves `curl` create → redirect → details → delete on `PORT` | `integration` | — | — | ⬜ |
| No dependency in `package.json`; `createServer()` does not listen | `code-read` | — | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** LNK-001..006, RTE-001..002, RUN-001..004, SEC-001 (validation).
**Workflow:** `.claude/workflows/phase-0-core-api.js` · **Evidence:** `.keel/evidence/phase-0.json`
**ADRs reserved at scope:** none (ADR-001, 002, 004 already Accepted)

---

## Phase 1 — Rate limit

**Goal:** each client IP can create at most 5 links in any rolling 60 s; the 6th is `429 rate_limited` with a correct `Retry-After`; proven with an injected clock.

**Scope** (PRD §3.6; ARCHITECTURE §3–5; ADR-003):
- `src/rate-limit.js`: rolling log per IP, pruning, IPv4-mapped IPv6 normalisation.
- Wire into `POST /links` in the order validate → limit → taken-check → create → record.
- Tests with `options.now`; README touch-up.

**Deliverables:**
- [ ] limiter module and wiring
- [ ] tests: 5 allowed / 6th 429; `Retry-After` ≥1 and exact at boundaries; slot frees at 60 000 ms; per-IP isolation; 400/409 do not consume slots
- [ ] full suite re-run (Phase 0 behaviour unchanged)

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Limiter suite green with a fake clock, including the rolling-window case a fixed window would fail | `integration` | — | — | ⬜ |
| Whole `node --test` suite green | `integration` | — | — | ⬜ |
| Live check: 6 rapid `curl` creates against `node src/main.js` → 6th is 429 with `Retry-After` header | `integration` | — | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** RAT-001, RAT-002, SEC-001.
**Workflow:** `.claude/workflows/phase-1-rate-limit.js` · **Evidence:** `.keel/evidence/phase-1.json`
**ADRs reserved at scope:** none (ADR-003 already Accepted)
**This is the launch gate** (v1 is "run `node src/main.js` for the team"; no staging or prod environment exists, so the highest level reachable is `integration`).

---

## Requirement coverage map

| Requirement group | Phase(s) |
|---|---|
| LNK-001..006, RTE-001..002, RUN-001..004 | 0 |
| RAT-001..002 | 1 |
| SEC-001 | 0 (validation) + 1 (limit) |

---

## Deferred items

| Item | Deferred from | Reason | Owner | Revisit trigger | Target | Status |
|---|---|---|---|---|---|---|
| Founder confirmation of OD-01..OD-05 defaults | Docs generation | Non-interactive run; defaults taken | founder | Before Phase 0 merge, or any time a default surprises someone | — | Open |

---

## Changes

| CHG | Date | Branch | Summary | ADR | Evidence | Deploy state |
|---|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — | — |

---

## Workflow scripts

| Script | Purpose |
|---|---|
| `.claude/workflows/doc-sync.js` | Mandatory pre-merge doc sync; cites `.keel/evidence/`; auto-archive on budget breach |
| `.claude/workflows/phase-0-core-api.js` | Phase 0: Setup → parallel worktree agents → Integrate → Verify → doc-sync → merge |
| `.claude/workflows/phase-1-rate-limit.js` | Phase 1: same stages for the rate limiter |
| `.claude/workflows/change-template.js` | Hotfix-weight unit; run via `/keel change <slug>` |

---
*End of IMPLEMENTATION_PLAN.md — shortlinks*
