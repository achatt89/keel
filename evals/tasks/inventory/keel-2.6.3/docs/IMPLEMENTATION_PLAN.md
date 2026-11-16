# inventory — Implementation Plan

**Version:** 0.1 · **Status:** Phase 1 not started · **References:** [ENGINEERING_DESIGN](./ENGINEERING_DESIGN.md), [BRD](./BRD.md), [PRD](./PRD.md), [ARCHITECTURE](./ARCHITECTURE.md), [LLD](./LLD.md), [NFR](./NFR.md)

## How to read this plan

Exactly three phases, in the founder's order, one per working session; each ends with tests and README current before the next starts (CON-004). `[ASSUMPTION]` There is no separate "Phase 0 guardrails": the project scaffolding (package.json, test layout, README skeleton) is Phase 1 scope, because the founder specified exactly three phases and there is no CI or lint stack to stand up (stdlib only, no deployment).

Two work units: a **Phase** (gated, own script and evidence file) and a **Change** (`CHG-xxx`, hotfix-weight, a row below + CHANGELOG line).

### Phase status

> Markers: ⬜ not started · 🔄 in progress · ✅ complete (every gate ✅ with evidence). Deploy state: `on-branch` → `merged` → `deployed vNN` → `live-verified`; authored only in [CHANGELOG](../CHANGELOG.md). A library has no deploy: `merged` is its terminal state.

| Phase | Status | Deploy state | Exit gate (one line) | Evidence | Last update |
|---|---|---|---|---|---|
| 1 — Items and stock | ⬜ | — | Every Phase 1 rule and code proven by `node --test`; README examples pass | — | — |
| 2 — Reservations | ⬜ | — | Reservations all-or-nothing; reserved stock never shipped; invariant test green | — | — |
| 3 — History and reorder | ⬜ | — | Movements and reorder report exact; seq gapless; atomicity suite green | — | — |

### Standing rules (every phase, every commit)

- **Workflow-first, branch-per-phase.** Run `claude --workflow .claude/workflows/phase-N-<slug>.js`: one phase branch off `main`, parallel task worktrees, merge back; only the phase branch (with the doc-sync commit) merges to `main`. A Change uses `chg/<slug>`. Mechanics: `.claude/workflows/README.md`.
- **Goal-directed tasks.** Each task agent opens with `/goal`. Exit strategy: bounded retries (N=3), then `/goal clear`, commit what works, add a Deferred items row for human review.
- **Tests ship with the code** (`node:test`). Rules in BRD §2 are proven by a test asserting the exact `code`; "no test was necessary" is a stated judgement.
- **Docs under test.** README examples live in `examples/` and run in `test/examples.test.js`; the README error table carries `<!-- keel:asserts test/examples.test.js -->` and every row has a triggering test (conventions "Docs under test").
- **Doc sync before merge:** `.claude/workflows/doc-sync.js` (proportional: inline for status-only, else delegate to the doc-sync subagent, ≤3 rounds, leftovers → Deferred items).
- **Decisions captured** as `docs/adr/ADR-xxx-<slug>.md` before merge (no addenda); open questions are rows in `docs/adr/README.md`. Negative results are recorded.
- **Definition of done:** `node --test` green · no dependency added · doc-sync commit present · `node .keel/doc-size.mjs` clean.
- **Review before done:** the code-changing diff is read against the invariants in AGENTS.md before the task is reported done. `[ASSUMPTION]` No security-audit skill or design role (declined).
- **Claims carry evidence:** `✅` needs a level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact; this project tops out at `unit`/`integration` (no deploy), and `prod-live` is not applicable.

---

## Phase 1 — Items and stock

**Goal:** items can be added and stock received, shipped and read, with exact error codes, in a package with tests and a README.

**Scope** (BRD ITM-001..003, STK-001..005, ERR-001..002; PRD F-01..F-04; LLD §2–5; ADR-001, ADR-002):
- `package.json` (`type: module`, `engines.node >=20`, no dependencies, `test` script `node --test`).
- `src/inventory.js`: `InventoryError`, `createInventory()` with `addItem`, `receive`, `ship`, `stock`; validators.
- `test/` suites per rule; hostile-input and atomicity tests for the Phase 1 calls; `examples/`.
- `README.md`: how to use the library, error table, how to run the tests.

**Deliverables:**
- [ ] `package.json`, `src/inventory.js`
- [ ] tests: every Phase 1 row of BRD §2 with its exact code; atomicity (NFR-COR-001), hostile input (NFR-SEC-001), package (NFR-MNT-001), API surface (NFR-MNT-002)
- [ ] README: examples in `examples/`, error table under test

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Each Phase 1 rule/code (ITM-001..003, STK-001..005) has a passing test with the exact `code` | `unit` | `test/items.test.js`, `test/stock.test.js` run | — | ⬜ |
| Failing calls leave state unchanged (NFR-COR-001) and hostile inputs are safe (NFR-SEC-001) | `unit` | `test/atomicity.test.js`, `test/hostile-input.test.js` | — | ⬜ |
| No dependencies, Node ≥ 20, API surface exactly 2 exports | `unit` | `test/package.test.js`, `test/api-surface.test.js` | — | ⬜ |
| README examples and error table pass | `unit` | `test/examples.test.js` | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** ITM, STK, ERR groups. **Workflow:** `.claude/workflows/phase-1-items-and-stock.js` · **Evidence:** `.keel/evidence/phase-1.json`
**ADRs reserved at scope:** none (ADR-001, ADR-002 accepted at generation)

---

## Phase 2 — Reservations

**Goal:** orders reserve stock all-or-nothing, and `ship` can never take reserved stock.

**Scope** (BRD RSV-001..008; PRD F-05..F-09; LLD §4; ADR-003):
- `reserve`, `available`, `release`, `fulfil`; per-item `reserved` total and open-orders map.
- `ship` checks `available` instead of on hand (F-09).
- Tests incl. seeded random-sequence invariant (NFR-COR-002); README and error table extended.

**Deliverables:**
- [ ] `reserve`, `available`, `release`, `fulfil`; `ship` limited to available
- [ ] tests: every Phase 2 row of BRD §2; invariant; atomicity for `reserve` with a failing last line; aliasing (NFR-SEC-002)
- [ ] README: Phase 2 API and error rows under test

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Each Phase 2 rule/code (RSV-001..008) has a passing test with the exact `code` | `unit` | `test/reservations.test.js` | — | ⬜ |
| Invariant holds over a seeded random sequence; reserved stock never shipped (NFR-COR-002) | `unit` | `test/invariant.test.js` | — | ⬜ |
| Multi-line `reserve` failing on any line reserves nothing (NFR-COR-001) | `unit` | `test/atomicity.test.js` | — | ⬜ |
| Phase 1 suite still green (no regression) | `unit` | `node --test` run | — | ⬜ |
| README examples and error table pass | `unit` | `test/examples.test.js` | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** RSV group, BO-01. **Workflow:** `.claude/workflows/phase-2-reservations.js` · **Evidence:** `.keel/evidence/phase-2.json`
**ADRs reserved at scope:** none (ADR-003 accepted at generation)

---

## Phase 3 — History and reorder

**Goal:** every successful change is recorded in order, and the reorder report says what to buy.

**Scope** (BRD HST-001..003, ROP-001..003; PRD F-10..F-13; LLD §3–4; ADR-004, ADR-005):
- Movement log with one global `seq`; movements for receive, ship, reserve, release, fulfil (one per line).
- `history(sku)`, `setReorderPoint`, `reorderReport`.
- Tests; final README.

**Deliverables:**
- [ ] movement recording in a single commit path; `history`; `setReorderPoint`; `reorderReport`
- [ ] tests: movement shapes and order, gapless `seq` across failed calls (NFR-COR-004), report sorting/formula/exclusions
- [ ] README: complete API, all error rows under test

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Each Phase 3 rule/code (HST-001..003, ROP-001..003) has a passing test | `unit` | `test/history.test.js`, `test/reorder.test.js` | — | ⬜ |
| `seq` gapless from 1; failed calls consume none (NFR-COR-001, 004) | `unit` | `test/atomicity.test.js` | — | ⬜ |
| Phase 1–2 suites and invariant test still green | `unit` | `node --test` run | — | ⬜ |
| Full README: every example runs, every error row triggered | `unit` | `test/examples.test.js` | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** HST, ROP groups, BO-02. **Workflow:** `.claude/workflows/phase-3-history-and-reorder.js` · **Evidence:** `.keel/evidence/phase-3.json`
**ADRs reserved at scope:** none (ADR-004, ADR-005 accepted at generation)

---

## Requirement coverage map

| Requirement group | Phase(s) |
|---|---|
| ITM-xxx, STK-xxx | 1 |
| RSV-xxx | 2 |
| HST-xxx, ROP-xxx | 3 |
| ERR-xxx, CON-xxx, NFR-* | 1–3 (gates) |

## Deferred items

| Item | Deferred from | Reason | Owner | Revisit trigger | Target | Status |
|---|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — | — |

## Changes

| CHG | Date | Branch | Summary | ADR | Evidence | Deploy state |
|---|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — | — |

## Workflow scripts

| Script | Purpose |
|---|---|
| `.claude/workflows/doc-sync.js` | Mandatory pre-merge doc sync; budget check and auto-archive |
| `.claude/workflows/change-template.js` | Hotfix-weight Change unit (`/keel change <slug>`) |
| `.claude/workflows/phase-1-items-and-stock.js` | Phase 1 |
| `.claude/workflows/phase-2-reservations.js` | Phase 2 |
| `.claude/workflows/phase-3-history-and-reorder.js` | Phase 3 |

*End of IMPLEMENTATION_PLAN.md — inventory*
