# inventory — Implementation Plan

**Version:** 0.1 (generated 2026-11-17) · **References:** [BRD.md](BRD.md), [PRD.md](PRD.md), [ENGINEERING_DESIGN.md](ENGINEERING_DESIGN.md), [ARCHITECTURE.md](ARCHITECTURE.md), [LLD.md](LLD.md), [NFR.md](NFR.md), [adr/README.md](adr/README.md)

## How to read this plan

Three phases, exactly as the founder specified (CON-004), one per working session, each finished (tests, README) before the next starts. There is no separate guardrails phase: scaffolding is the first task of Phase 1. A phase is open until every gate is `✅` with an evidence level and an artefact. Phases 1–3 deliver the whole library; there is no deploy (see [DEPLOYMENT.md](DEPLOYMENT.md) stub).

Two work units (conventions "Two work units"): a **Phase** has a block, script and evidence file; a **Change** (`CHG-xxx`) is hotfix-weight, with a row in Changes and a CHANGELOG line.

### Phase status

| Phase | Status | Deploy state | Exit gate (one line) | Evidence | Last update |
|---|---|---|---|---|---|
| 1 — Items and stock | ⬜ | — | Every Phase 1 code proven by a test; README examples pass | — | — |
| 2 — Reservations | ⬜ | — | All-or-nothing and "never ship reserved stock" proven; README updated | — | — |
| 3 — History and reorder | ⬜ | — | seq/history/report rules proven; README complete | — | — |

### Standing rules

- **Workflow-first, branch-per-phase.** Run `claude --workflow .claude/workflows/phase-N-<slug>.js`. It creates `phase-N-<slug>` off `main`, fans tasks out to separate `git worktree`s, integrates, verifies, runs doc-sync, merges. No direct commits to `main`. A Change uses `chg/<slug>`. Mechanics: `.claude/workflows/README.md`.
- **Goal-directed tasks.** Each worktree agent opens with `/goal`. Exit strategy: bounded retries (3 fix-and-retest cycles), then `/goal clear`, commit, add a Deferred items row for human review. [ASSUMPTION] default chosen; founder did not specify.
- **Tests ship with the code.** Unit tests with `node:test`. Rule behaviour is proven by a test, never asserted in prose.
- **Docs under test.** README examples live in `examples/` with expected output and run in `test/examples.test.js`; each error-table row carries `<!-- keel:asserts test/<file> -->` and has a test that triggers it (conventions "Docs under test").
- **Doc sync before merge.** Run `.claude/workflows/doc-sync.js`: AGENTS.md status, this table, ADRs, deferred items, CHANGELOG `[Unreleased]`, byte budgets. Proportional: status-only changes inline; record-doc changes delegated to the `doc-sync` subagent, ≤3 rounds.
- **Decisions captured.** A decision made during work becomes `docs/adr/ADR-xxx-<slug>.md` before merge (ids reserved at phase Setup: ADR-004..006). A founder answer to an Open decision becomes an ADR and removes its `[ASSUMPTION]`.
- **Definition of done per PR:** `node --test` green · README examples and error table pass · doc-sync commit present.
- **Claims carry evidence.** `✅` needs a level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact. Verify writes `.keel/evidence/phase-N.json`; doc-sync cites it.
- **Review before done.** No security or design reviewer is configured (both declined in the interview); a code review of the diff against NN-1..NN-6 is the stand-in, at `code-read`.

---

## Phase 1 — Items and stock

**Goal:** items can be added, received, shipped and counted, and every Phase 1 rule fails with its exact code.

**Scope** (STK-001..STK-010, SEC-001, DEL-001, DEL-002; [LLD.md](LLD.md) §1–§5; [ADR-001](adr/ADR-001-runtime-and-test-stack.md), [ADR-002](adr/ADR-002-error-contract.md), [ADR-003](adr/ADR-003-validate-then-commit.md)):
- Scaffold `package.json` (`type: module`, `engines.node >=20`, `scripts.test`), `src/inventory.js` with `InventoryError`, `createInventory`, validators.
- `addItem`, `receive`, `ship`, `stock` with the check order of LLD §5.
- Tests: `test/items-stock.test.js`, `test/errors.test.js`, `test/atomicity.test.js`, `test/input-safety.test.js`, `test/maintainability.test.js`.
- README: how to use the library, how to run the tests, error table (Phase 1 codes), examples under `examples/`.

**Deliverables:**
- [ ] `package.json`, `src/inventory.js`
- [ ] tests listed above
- [ ] `README.md` + `examples/` + `test/examples.test.js` (README: examples in `examples/`, error table under test)

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Each Phase 1 code (`invalid_sku`, `invalid_input`, `duplicate_sku`, `invalid_qty`, `not_found`, `insufficient_stock`) thrown as `InventoryError` with the exact `code` (NFR-COR-001) | `unit` | `test/errors.test.js` | — | ⬜ |
| Failed calls change nothing (NFR-COR-003); bad-input table gives `InventoryError`, never `TypeError` (NFR-SEC-001); returned data are copies (NFR-SEC-002, NFR-SEC-003) | `unit` | `test/atomicity.test.js`, `test/input-safety.test.js` | — | ⬜ |
| No dependencies, Node ≥ 20, ESM, only `node:` imports (NFR-MNT-001, NFR-MNT-002) | `unit` | `test/maintainability.test.js` | — | ⬜ |
| README examples and error table pass | `unit` | `test/examples.test.js` | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** F-01, F-02, F-07 · STK-*, SEC-001.
**Workflow:** `.claude/workflows/phase-1-items-and-stock.js` · **Evidence:** `.keel/evidence/phase-1.json`
**ADRs reserved at scope:** none (ADR-001..003 are accepted).

---

## Phase 2 — Reservations

**Goal:** orders reserve stock all-or-nothing, and reserved stock can never be shipped or reserved twice.

**Scope** (RSV-001..RSV-010; [LLD.md](LLD.md) §6; NFR-COR-002):
- `reserve`, `available`, `release`, `fulfil`; `ship` limited to available.
- Property test: random operation sequences keep `0 ≤ reserved ≤ onHand`.
- README, examples and error table extended with the Phase 2 API and codes (`invalid_order`, `duplicate_order`).

**Deliverables:**
- [ ] reservation state and four methods in `src/inventory.js`
- [ ] `test/reservations.test.js`, `test/reservation-property.test.js`
- [ ] README: examples in `examples/`, error table under test

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| `reserve` is all-or-nothing; `duplicate_order`, `invalid_order`, `not_found`, `insufficient_stock` carry exact codes (RSV-001..RSV-004) | `unit` | `test/reservations.test.js` | — | ⬜ |
| `release`/`fulfil` close the order; second call `not_found` (RSV-006..RSV-008) | `unit` | `test/reservations.test.js` | — | ⬜ |
| `ship` limited to available; invariant holds across random sequences (RSV-009, RSV-010, NFR-COR-002) | `unit` | `test/reservation-property.test.js` | — | ⬜ |
| Phase 1 suites still green | `unit` | `node --test` output | — | ⬜ |
| README examples and error table pass | `unit` | `test/examples.test.js` | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** F-03, F-04 · RSV-*, RSK-001.
**Workflow:** `.claude/workflows/phase-2-reservations.js` · **Evidence:** `.keel/evidence/phase-2.json`
**ADRs reserved at scope:** ADR-004 reservation model; ADR-005 ship uses available.

---

## Phase 3 — History and reorder

**Goal:** every change is a movement with a global `seq`, `history` returns them, and `reorderReport` suggests what to reorder.

**Scope** (HIS-001..HIS-006, ROR-001..ROR-006; [LLD.md](LLD.md) §7–§8; NFR-COR-004):
- Movement log across all mutators; `history`.
- `setReorderPoint`, `reorderReport`.
- README, examples and error table completed.

**Deliverables:**
- [ ] movement recording inside every commit block
- [ ] `test/history.test.js`, `test/reorder.test.js`
- [ ] README complete: examples in `examples/`, error table under test

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Movement shape, types, one per line for order operations, `orderId` only on order movements (HIS-001..HIS-003) | `unit` | `test/history.test.js` | — | ⬜ |
| `seq` global, gapless from 1, untouched by failed calls; `history` oldest first (HIS-004..HIS-006, NFR-COR-004) | `unit` | `test/history.test.js` | — | ⬜ |
| `setReorderPoint` codes; report membership, sort, shape, `suggestedQty`, no point means not listed (ROR-001..ROR-006) | `unit` | `test/reorder.test.js` | — | ⬜ |
| Phase 1–2 suites still green | `unit` | `node --test` output | — | ⬜ |
| README examples and error table pass | `unit` | `test/examples.test.js` | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** F-05, F-06 · HIS-*, ROR-*, BO-02.
**Workflow:** `.claude/workflows/phase-3-history-and-reorder.js` · **Evidence:** `.keel/evidence/phase-3.json`
**ADRs reserved at scope:** ADR-006 movement log.

---

## Requirement coverage map

| Requirement group | Phase(s) |
|---|---|
| STK-001..STK-010 | 1 |
| RSV-001..RSV-010 | 2 |
| HIS-001..HIS-006, ROR-001..ROR-006 | 3 |
| SEC-001, DEL-001, DEL-002 | 1–3 (gates in each phase) |

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
| `.claude/workflows/doc-sync.js` | Mandatory pre-merge doc sync; byte-budget check and auto-archive |
| `.claude/workflows/phase-1-items-and-stock.js` | Phase 1: Setup → Build → Integrate → Verify → doc-sync → merge |
| `.claude/workflows/phase-2-reservations.js` | Phase 2 (same stages; reserves ADR-004, ADR-005) |
| `.claude/workflows/phase-3-history-and-reorder.js` | Phase 3 (same stages; reserves ADR-006) |
| `.claude/workflows/change-template.js` | Template for `/keel change <slug>` |
