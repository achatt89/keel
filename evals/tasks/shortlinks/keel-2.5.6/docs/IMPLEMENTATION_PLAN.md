# shortlinks — Implementation Plan

**Version:** 0.1 · **Status:** Draft — nothing built
**References:** `BRD.md`, `PRD.md`, `ARCHITECTURE.md`, `adr/README.md`, `COMMANDS.md`

---

## How to read this plan

Phases are ordered by one rule: **guardrails exist before the behaviour that could violate them.** Phase 0 builds a runnable skeleton in which the stdlib-only rule, the uniform error format and the 404/405 matrix are already tested; Phase 1 adds the link API; Phase 2 adds the rate limit and ships. Gates are runnable suites. Phases 0–2 deliver the whole of v1 (the launch line is Phase 2).

Two units of work exist: a **Phase** (gated milestone, workflow script, evidence file) and a **Change** (`CHG-xxx`, hotfix-weight: a row in Changes + a CHANGELOG line, no phase block).

### Phase status

> Updated by doc-sync (state-neutral) and the Merge step. ⬜ not started · 🔄 in progress · ✅ complete (every gate ✅ with evidence). Deploy state: `on-branch` → `merged` → `deployed vNN` → `live-verified`. For this project "deployed" means running via `node src/main.js` on the team machine (no DEPLOYMENT doc, CON-005).

| Phase | Status | Deploy state | Exit gate (one line) | Evidence | Last update |
|---|---|---|---|---|---|
| 0 — Skeleton & Guardrails | ⬜ | — | guardrail tests green: no deps, `node:`-only imports, uniform errors, 404/405 matrix | — | — |
| 1 — Link API | ⬜ | — | every PRD §4–§5 status/error code has a passing test over real HTTP | — | — |
| 2 — Rate Limit & Launch | ⬜ | — | rate-limit suite exact at every tested offset; README done; live curl pass | — | — |

### Standing rules (apply to every phase, every commit)

- **Workflow-first, branch-per-phase.** Run `claude --workflow .claude/workflows/phase-N-<slug>.js` (or the Workflow tool). The script creates `phase-N-<slug>` off `main`, fans out divisible tasks into separate `git worktree`s, merges task branches into the phase branch, runs Verify, doc-sync and Merge. No direct commits to `main`. Changes: `chg/<slug>` off `main` via `/keel change <slug>`. `main` needs at least one commit before the first phase runs (commit the docs).
- **Goal-directed, self-contained tasks.** Every worktree agent opens with `/goal` (code, tests, `node --test` green, verify end-to-end). Exit strategy: **bounded retries (N=3), then `/goal clear` + commit + a deferred-items row for human review** `[ASSUMPTION]` (default; founder did not choose).
- **Tests ship with the code.** `node:test` only. Behaviour in PRD §4–§6 is proven by a test, never asserted in prose.
- **Doc sync is mandatory before merge** (`.claude/workflows/doc-sync.js`): AGENTS.md status · this file's tables · `docs/adr/` · CHANGELOG `[Unreleased]` · byte budgets. A branch without the doc-sync commit is not done.
- **Decisions captured without fail.** Any decision made while building → `docs/adr/ADR-xxx-<slug>.md` (next free number at Integrate, never in a worktree). ADR-002..005 are `Proposed` and flip to `Built` in their phase; open founder questions stay in `adr/README.md`. Negative results are recorded.
- **Definition of done per PR:** `node --test` green · guardrail tests green (no deps) · doc-sync commit present · `node .keel/doc-size.mjs` passes.
- **Claims carry evidence.** `✅` needs an evidence level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact. Verify writes `.keel/evidence/phase-N.json`. There is no staging/prod environment: the highest level reachable is `integration` (real HTTP against a locally started server).

---

## Phase 0 — Skeleton & Guardrails

**Goal:** a runnable, stdlib-only server skeleton where the dependency rule, the error format and the 404/405 matrix are already enforced by tests.

**Scope** (`ARCHITECTURE.md` §1–§2; ADR-001, ADR-005; `PRD.md` §3–§4; `COMMANDS.md`):
- `package.json` (no dependencies, `engines.node >=20`, `test`/`start` scripts, CommonJS) and `src/main.js` (`PORT`, default 3000; invalid `PORT` exits non-zero).
- `src/server.js` `createServer(options)` → non-listening `http.Server`, `options.now` default `Date.now`; routing by path shape; `src/errors.js` `sendError`.
- `test/helpers/`: ephemeral-port server starter, JSON request helper, fake clock.

**Deliverables:**
- [ ] `package.json`, `src/main.js`, `src/server.js`, `src/errors.js`
- [ ] test helpers
- [ ] tests: guardrails (no deps; `src/` imports only `node:`/relative; factory not listening; error shape) and the routing 404/405 matrix

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Guardrail test fails if a dependency or non-`node:` import is introduced (shown by temporarily adding one) | `integration` | `.keel/evidence/phase-0/` | agent | ⬜ |
| Routing matrix test: every row of PRD §4 returns the stated 404/405 with `{"error":…}` | `integration` | test file + run output | — | ⬜ |
| `createServer()` returns a server that is not listening; two instances share no state | `unit` | test file + run output | — | ⬜ |
| `PORT` handling: default 3000, bad value exits non-zero | `integration` | test file + run output | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** F-05, F-07, F-08 · VAL-004, VAL-005, DLV-001, DLV-003, CON-001..004.
**Workflow:** `.claude/workflows/phase-0-skeleton-guardrails.js` · **Evidence:** `.keel/evidence/phase-0.json`
**ADRs reserved at scope:** none — ADR-001 accepted, ADR-005 written (flips to `Built` here for the routing half).

---

## Phase 1 — Link API

**Goal:** create, inspect, redirect and delete links with every validation rule and exact status/error codes.

**Scope** (`PRD.md` §4–§5, §7; ADR-001, ADR-004, ADR-005):
- `src/validate.js` (url, code), `src/store.js` (Map; hits; `createdAt` from `options.now`; CSPRNG code generation).
- Handlers: `POST /links` (201/400/409/413), `GET /<code>` (302 + one hit), `GET /links/<code>`, `DELETE /links/<code>` (204). Reserved code `links`. No rate limiting yet.

**Deliverables:**
- [ ] validators, store, handlers
- [ ] tests: validator boundaries (url 2048/2049; code 3/4/16/17; schemes; relative URLs; control chars; non-object JSON; `null`/`""` code), conformance over HTTP, hit counting, delete-then-recreate, reserved code, body cap, ISO `createdAt` under the fake clock

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Conformance suite: every status/error code in PRD §4–§5 asserted over real HTTP | `integration` | test file + run output | — | ⬜ |
| Validator boundary tests green (all rows of PRD §5 "Boundaries to test") | `unit` | test file + run output | — | ⬜ |
| Hits: only 302s count; 404/inspect/failed create do not | `integration` | test file + run output | — | ⬜ |
| Generated codes match `^[A-Za-z0-9]{7}$` over many draws; collision retry covered | `unit` | test file + run output | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** F-01..F-04 · LNK-001..005, RDR-001, RDR-002, VAL-001..003.
**Workflow:** `.claude/workflows/phase-1-link-api.js` · **Evidence:** `.keel/evidence/phase-1.json`
**ADRs reserved at scope:** none — ADR-004 (validation half), ADR-005 (reserved code) flip to `Built` here.

---

## Phase 2 — Rate Limit & Launch

**Goal:** prove, don't assert — the limit is exact, the docs match, and a real server answers every case.

**Scope** (`PRD.md` §6; ADR-002, ADR-003, ADR-004; `COMMANDS.md`):
- `src/rate-limiter.js` (sliding log, injected clock, pruning) wired into `POST /links` after validation, before `code_taken`, synchronous with the write.
- `README.md` at repo root (run, test, curl walkthrough, restart caveat).
- Launch checks: full `node --test`; live curl pass against `node src/main.js`.

**Deliverables:**
- [ ] limiter + wiring; tests; `README.md`
- [ ] live-pass transcript in `.keel/evidence/phase-2/`

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Fake-clock suite: 5 succeed, 6th → 429; `Retry-After` exact at t=0, 10 000, 59 999 (→ 1); slot frees at exactly +60 000; window is rolling | `integration` | test file + run output | — | ⬜ |
| 400/409/413 and `DELETE` do not consume or free slots | `integration` | test file + run output | — | ⬜ |
| Limiter unit: IPs independent; `::ffff:` normalised; empty entries pruned | `unit` | test file + run output | — | ⬜ |
| Full `node --test` green with zero npm dependencies | `integration` | run output | — | ⬜ |
| Live pass: `node src/main.js`, curl covers every status in PRD §4–§6 incl. a real 429 with `Retry-After` header | `integration` | `.keel/evidence/phase-2/live-pass.md` | human or agent | ⬜ |
| README states how to run the service and the tests; a fresh reader can follow it | `code-read` | commit | human | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**This is the launch gate** (highest reachable level is `integration`; no staging/prod exists — CON-005).
**Traceability:** F-06, F-08 · ABU-001, ABU-002, DLV-002, BO-02, BO-04.
**Workflow:** `.claude/workflows/phase-2-rate-limit-launch.js` · **Evidence:** `.keel/evidence/phase-2.json`
**ADRs reserved at scope:** none — ADR-002, ADR-003 and the limiter-position half of ADR-004 flip to `Built` here.

---

## Requirement coverage map

| Requirement group | Phase(s) |
|---|---|
| LNK-xxx, RDR-xxx | 1 |
| VAL-001..003 | 1 |
| VAL-004, VAL-005 | 0 |
| ABU-xxx | 2 |
| DLV-001, DLV-003 | 0 (grows through 2) |
| DLV-002 | 2 |
| CON-xxx, BO-xx | 0–2 (gates) |

---

## Deferred items

| Item | Deferred from | Reason | Owner | Revisit trigger | Target | Status |
|---|---|---|---|---|---|---|
| *(none yet — items added by doc-sync as work progresses)* | — | — | — | — | — | — |

---

## Changes

| CHG | Date | Branch | Summary | ADR | Evidence | Deploy state |
|---|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — | — |

---

## Workflow scripts

| Script | Purpose |
|---|---|
| `.claude/workflows/doc-sync.js` | Mandatory pre-merge doc sync (delegate → review Report → ≤3 rounds → commit); budget check, auto-archive/split, evidence prune |
| `.claude/workflows/change-template.js` | Hotfix-weight Change unit (`/keel change <slug>`) |
| `.claude/workflows/phase-0-skeleton-guardrails.js` | Phase 0 — Setup → Build → Integrate → Verify → Doc Sync → Merge |
| `.claude/workflows/phase-1-link-api.js` | Phase 1 — same stages |
| `.claude/workflows/phase-2-rate-limit-launch.js` | Phase 2 — same stages |

---

*End of IMPLEMENTATION_PLAN.md — shortlinks*
