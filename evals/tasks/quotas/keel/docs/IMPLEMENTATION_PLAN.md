# filestore — Implementation Plan

**Version:** 0.1 · **Status:** Phase 1 built per founder (unverified, code not in tree) · Phase 2 scoped, not started
**References:** [BRD.md](./BRD.md) · [PRD.md](./PRD.md) · [ENGINEERING_DESIGN.md](./ENGINEERING_DESIGN.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [LLD.md](./LLD.md) · [NFR.md](./NFR.md)

---

## How to read this plan

Order rule: **the single source of limits and the error contract come before anything that consumes them.** Phase 1 (core) exists; Phase 2 adds quotas; Phase 3 (HTTP) is out of scope and is scoped later with `/keel phase new`. The launchable line is Phases 1–2 as a module; there is no deployment before Phase 3, so no `staging`/`prod-live` gate exists yet (`DEPLOYMENT.md` omitted, trigger: Phase 3).

Two units of work (conventions): a **Phase** is a gated milestone (block, script, evidence file); a **Change** (`CHG-xxx`) is hotfix-weight (row + CHANGELOG line, no block). Phases are inserted as `N.1`, split as `N.a/N.b`; never renumbered.

### Phase status

| Phase | Status | Deploy state | Exit gate (one line) | Evidence | Last update |
|---|---|---|---|---|---|
| 1 — Core | 🔄 | — | Phase 1 code present in the repo and its contract tests green (`OD-07`) | — | 2026-11-16 |
| 2 — Storage quotas | ⬜ | — | AC-1..AC-13 + NFR-CORR/SEC suites green; limits equal the pricing page | — | 2026-11-16 |
| 3 — HTTP API | ⬜ | — | not scoped (out of scope for now) | — | 2026-11-16 |

### Standing rules (apply to every phase, every commit)

- **Workflow-first, branch-per-phase.** Every **phase** runs its script: `claude --workflow .claude/workflows/phase-N-<slug>.js`. The script creates one phase branch off `main`, fans out divisible tasks as parallel agents in separate `git worktree`s, merges them back into the phase branch, and only the phase branch (tasks + evidence + doc-sync commit) ever merges to `main`. No direct commits to `main`. A **Change** is `chg/<slug>` off `main` with a Changes row + CHANGELOG line.
- **Goal-directed, self-contained tasks.** Every worktree agent opens its task with `/goal` (implementation done, tests pass, `verify` confirms behaviour). Exit strategy when the goal isn't met: **bounded retries (N=3), then `/goal clear` + commit what works + a deferred-items row for human review** `[ASSUMPTION: founder did not choose; recommended default]`.
- **Tests ship with the code.** `node:test` suites alongside every change; correctness-critical behaviour (limits, boundaries, order, atomicity) is **proven by a test**, never asserted in prose.
- **Doc sync is mandatory before merge.** `.claude/workflows/doc-sync.js` updates AGENTS.md status · this plan's tables · `docs/adr/` · deferred/Changes tables · CHANGELOG `[Unreleased]` · byte budgets. A merge without the doc-sync commit is incomplete.
- **Decisions captured without fail.** Any "we chose X over Y" becomes `docs/adr/ADR-xxx-<slug>.md` before merge (ID reserved at scope or taken at Integrate, never in a worktree). Open questions stay one row each in `docs/adr/README.md`. Negative results are recorded too.
- **Definition of done per PR:** `node --test` green · `node --check src/*.js` clean · no dependency added · doc-sync commit present.
- **Claims carry evidence.** `✅` only with an evidence level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact. Verify writes `.keel/evidence/phase-N.json`; doc-sync cites it. This project's launch-gate level is `unit`/`integration` (a library; nothing is deployed). Only a deploy can write `prod-live`.

---

## Phase 1 — Core *(built per founder; confirm and evidence)*

**Goal:** the metadata core exists in the repo and its behaviour is pinned by tests, so Phase 2 builds on verified ground.

**Scope** (`PRD.md F-01..F-03`; `LLD.md §3`, `§8`; `ADR-001`, `ADR-002`):
- Users `u_N` with name and plan `free`/`pro`/`team`; files by path with size and version; overwrite bumps version; `list` by prefix, `remove`, `setPlan` (never deletes files), `summary`; `StoreError` with `invalid_input` / `not_found`; unknown user reported before bad input.
- No new code is written by this phase: it **imports/locates the existing code** (`OD-07`), reconciles `LLD.md §3`/`§8` with it (`OD-01`, `OD-04`, `OD-08`), and adds the missing contract tests.

**Deliverables:**
- [ ] `src/store.js`, `src/units.js` present in the repo
- [ ] tests: Phase 1 contract (`F-01..F-03`), `NFR-SEC-001..003` (validation, ids, isolation), `NFR-MAINT-001`

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Existing code is in the repo (commit) and `node --test` is green | `unit` | — | — | ⬜ |
| Validation, id-forgery and isolation suites green (`NFR-SEC-001..003`) | `unit` | — | — | ⬜ |
| `LLD.md §3`/`§8` reconciled with the code; `OD-01`, `OD-04`, `OD-08` closed | `code-read` | — | human | ⬜ |
| Doc-sync commit present | `code-read` | — | doc-sync | ⬜ |

**Traceability:** `USR-001..003`, `FIL-001..004`, `ERR-001`, `ERR-002`, `SEC-001..003`.
**Workflow:** none generated — Phase 1 is not built by a script; run Phase 1's gates by hand or as a `/keel change` (CHG row) once the code is added. **Evidence:** `.keel/evidence/phase-1.json`
**ADRs reserved at scope:** none (ADR-001, ADR-002 already written).

---

## Phase 2 — Storage quotas

**Goal:** every write is checked against the user's plan limit (decimal GB) and refused with `quota_exceeded` + `details`; `usage()` reports used, limit and percent; every number equals the pricing page.

**Scope** (`PRD.md F-04..F-08`; `LLD.md §4–§6`; `ADR-003`, `ADR-004`, `ADR-005`, `ADR-006`):
- `src/plans.js`: `GB`, frozen `PLAN_LIMITS_BYTES` (free 2,000,000,000 · pro 200,000,000,000 · team `null`), `limitFor`.
- Quota decision in write: delta-based, inclusive limit, shrink/same-size always allowed, safe-integer ceiling, decide-then-mutate; `StoreError` `quota_exceeded` with `{ limitBytes, usedBytes, requestedBytes }`.
- `usage(user)`: floor percent via BigInt; `team` → nulls; unknown user → `not_found`; `remove` frees space at once.
- Usage counter and its invariant test (`ADR-006` decided and Accepted during the phase).
- Not in scope: summary-line change (`OD-02`), percent cap (`OD-03`), `team` ceiling (`OD-05`).

**Deliverables:**
- [ ] `src/plans.js`; quota + `usage()` in `src/store.js`
- [ ] tests: `plans`, `quota` (AC-1..AC-13), `usage`, `errors` matrix, `invariant`, `boundaries`

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Limits table equals the pricing page literals (`NFR-CORR-001`) and the founder confirmed against the live page | `unit` | — | founder | ⬜ |
| Quota suite: AC-1..AC-13 each a named, green test (`NFR-CORR-002`, `-004`) | `unit` | — | — | ⬜ |
| Error-order matrix green for every method (`NFR-CORR-005`) | `unit` | — | — | ⬜ |
| `usage()` suite incl. 99.99 % → 99 and > 2^53/100 case (`NFR-CORR-006`) | `unit` | — | — | ⬜ |
| `usedBytes` invariant over ≥ 1,000 seeded random sequences (`NFR-CORR-003`) | `unit` | — | — | ⬜ |
| Boundary tests: no `units.js` in limits; no dependencies (`NFR-CORR-007`, `NFR-SEC-004`) | `unit` | — | — | ⬜ |
| `ADR-006` Accepted and filled; no `[NEEDS DECISION]` left that Phase 2 touches | `code-read` | — | human | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** `QTA-001..008`, `ERR-001`, `ERR-002`, `SEC-004`, `BO-01..03`.
**Workflow:** `.claude/workflows/phase-2-storage-quotas.js` · **Evidence:** `.keel/evidence/phase-2.json`
**ADRs reserved at scope:** ADR-006 — usage counter vs recompute.
**Precondition:** Phase 1's code is in the repo (`OD-07`) — the script's tasks edit `src/store.js`.

---

## Phase 3 — HTTP API *(not scoped)*

Out of scope for now. Scope it with `/keel phase new http-api` after Phase 2 closes. It must at least decide: size sourced from object storage (`RSK-004`), HTTP status mapping of the three codes, GDPR basics for account names (`OD-06`), persistence (`RSK-006`), and then add `DEPLOYMENT.md`, `RUNBOOK.md`, `COMPLIANCE.md` (see `docs/README.md` omissions).

---

## Requirement coverage map

| Requirement group | Phase(s) |
|---|---|
| USR-001..003, FIL-001..004 | 1 |
| ERR-001, ERR-002, SEC-001..003 | 1 (+ matrix extended in 2) |
| QTA-001..008, SEC-004 | 2 |
| BO-01..BO-04 | 1–2 (gates) |
| HTTP, persistence, GDPR | 3 (unscoped) |

---

## Deferred items

| Item | Deferred from | Reason | Owner | Revisit trigger | Target | Status |
|---|---|---|---|---|---|---|
| Summary line shows usage/limit | Phase 2 | Founder did not ask; binary vs decimal labelling unresolved (`OD-02`) | founder | founder asks for it, or first support case about "1.86 GB" | — | ⬜ |
| Cap on `team` | Phase 2 | Pricing says unlimited (`OD-05`) | founder | first `team` user above an agreed cost threshold | — | ⬜ |

---

## Changes

| CHG | Date | Branch | Summary | ADR | Evidence | Deploy state |
|---|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — | — |

---

## Workflow scripts

| Script | Purpose |
|---|---|
| `.claude/workflows/doc-sync.js` | Mandatory pre-merge doc sync; cites `.keel/evidence/`; auto-archive/split on budget breach. |
| `.claude/workflows/change-template.js` | Hotfix-weight unit run by `/keel change <slug>`. |
| `.claude/workflows/phase-2-storage-quotas.js` | Phase 2: Setup (reserve ADR-006) → 2 parallel tasks (plans table; enforcement + `usage()`) → Integrate → Verify → doc-sync → merge. |

---

*End of IMPLEMENTATION_PLAN.md — filestore*
