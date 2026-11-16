# inventory — Implementation Plan

**Version:** 0.1 · **Status:** Draft · **References:** [BRD.md](./BRD.md), [ENGINEERING_DESIGN.md](./ENGINEERING_DESIGN.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [LLD.md](./LLD.md), [NFR.md](./NFR.md)

---

## How to read this plan

Exactly three phases, the founder's order (CON-006), one phase per working session; each ends with tests and README current before the next starts. There is no Phase 0: the scaffold (`package.json`, test runner) is Phase 1's first deliverable because the stack is one file and `node --test`. Two units of work exist: a **Phase** (gated, own script and evidence file) and a **Change** (`CHG-xxx`, no gate of its own).

### Phase status

> Markers: ⬜ not started · 🔄 in progress · ✅ complete (every gate ✅ with evidence). Deploy state is copied from CHANGELOG.md; nothing deploys (library).

| Phase | Status | Deploy state | Exit gate (one line) | Evidence | Last update |
|---|---|---|---|---|---|
| 1 — Items and stock | ⬜ | — | Phase 1 error codes and boundaries tested; README examples pass | — | — |
| 2 — Reservations | ⬜ | — | All-or-nothing and no-double-ship invariants proven | — | — |
| 3 — History and reorder | ⬜ | — | Every change is a movement; reorder report exact; whole suite green | — | — |

### Standing rules (apply to every phase, every commit)

- **Workflow-first, branch-per-phase.** Run the phase script (`claude --workflow .claude/workflows/phase-N-<slug>.js`). It creates `phase-N-<slug>` off `main`, fans divisible tasks into separate `git worktree`s, merges them back, verifies once, runs doc-sync, merges. No direct commits to `main`. A Change (`CHG-xxx`) uses `chg/<slug>` off `main` with a Changes row + CHANGELOG line instead of a phase block.
- **Goal-directed tasks.** Each worktree agent opens with `/goal` (implementation done, `node --test` green, behaviour exercised end to end). Exit strategy when unmet: **bounded retries (N=3), then `/goal clear` + commit + a deferred-items row for human review** [ASSUMPTION: Keel default; founder did not choose].
- **Tests ship with the code.** Unit tests for every rule and every error code; "no test was necessary" is a stated judgement, never a default.
- **Docs under test.** README examples live in `examples/` and run in `test/examples.test.js`; the error table carries `<!-- keel:asserts test/errors.test.js -->` and each row has a test. Each phase's README work carries the gate `README examples and error table pass`.
- **Doc sync before merge.** Run `.claude/workflows/doc-sync.js` after each unit of work: AGENTS.md status, this phase table, ADRs, deferred items, CHANGELOG `[Unreleased]`, byte budgets. Status-only changes sync inline; record-doc changes delegate to doc-sync (≤3 rounds, then deferred items).
- **Decisions captured.** A decision made during build becomes an ADR before the merge (next free number at Integrate). Resolve or confirm the Open decisions in `docs/adr/README.md` before the phase that builds them; filling an ADR's `Build deviation` row is the only edit after acceptance.
- **Definition of done per PR:** `node --test` green with no skipped test · no dependency added · README current · doc-sync commit present.
- **Review before done.** No security or design reviewer is configured (founder declined the security-audit skill; no UI). Re-run `/keel upgrade` to add one.
- **Claims carry evidence.** `✅` needs a level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact (commit, test report). Verify writes `.keel/evidence/phase-N.json`; only a deploy writes `prod-live` (a library never reaches it).

---

## Phase 1 — Items and stock

**Goal:** `addItem`, `receive`, `ship`, `stock` work with every stated error code, with tests and README.

**Scope** (LLD.md §1–§4; ADR-001, ADR-002, ADR-005; PRD F-01..F-04, F-12, F-13):
- Scaffold `package.json` (ESM, `engines.node >=20`, `scripts.test = node --test`, no dependencies) and `src/inventory.js` with `createInventory`, `InventoryError`.
- `addItem`, `receive`, `ship` (against on hand), `stock` with validation per LLD §4.
- README: usage, error table, how to run tests; examples in `examples/`, error table under test.

**Deliverables:**
- [ ] `package.json`, `src/inventory.js`
- [ ] `test/errors.test.js`, `test/items.test.js` (each error code; boundaries: qty 0, -1, 1.5, "3", NaN; ship to exactly zero)
- [ ] `README.md`, `examples/`, `test/examples.test.js`

**Exit gates:**
| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| `node --test` green: every Phase 1 error code (`invalid_sku`, `invalid_input`, `duplicate_sku`, `invalid_qty`, `not_found`, `insufficient_stock`) triggered per LLD §4; ship never below zero | `unit` | — | — | ⬜ |
| Hostile ids and caller-mutation tests green (NFR-SEC-001, NFR-SEC-002) | `unit` | — | — | ⬜ |
| `package.json` has no dependencies; runs on Node 20+ clean checkout (NFR-MNT-001) | `unit` | — | — | ⬜ |
| README examples and error table pass (`test/examples.test.js`) | `unit` | — | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | — | ⬜ |

**Traceability:** ITM-001..ITM-006, GEN-001..GEN-005, SEC-001, SEC-002, DOC-001, DOC-002.
**Workflow:** `.claude/workflows/phase-1-items-and-stock.js` · **Evidence:** `.keel/evidence/phase-1.json`
**ADRs:** ADR-001, ADR-002, ADR-005 (written at generation; Build deviation filled at close)

---

## Phase 2 — Reservations

**Goal:** `reserve`, `available`, `release`, `fulfil` hold all-or-nothing, and `ship` can never use reserved stock.

**Scope** (LLD.md §3–§5; ADR-003, ADR-005; PRD F-05..F-08):
- `reserve` (all or nothing), `available`, `release`, `fulfil` per LLD §3–§4.
- `ship` now limited to available quantity (RSV-005); Phase 1 tests stay green.
- README updated; error table gains `invalid_order`, `duplicate_order`.

**Deliverables:**
- [ ] `src/inventory.js` extended
- [ ] `test/reservations.test.js` (all-or-nothing with last line short; duplicate_order; release/fulfil twice → not_found; reserved stock cannot be shipped; duplicate-SKU lines)
- [ ] Invariant test NFR-COR-002 (seeded random sequence)
- [ ] README + examples updated

**Exit gates:**
| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| `node --test` green: `invalid_order`, `duplicate_order`, `insufficient_stock` (reserve and ship), `not_found` (release/fulfil) triggered per LLD §4 | `unit` | — | — | ⬜ |
| Invariant test: on hand ≥ 0, reserved ≤ on hand, shipped never exceeds received over ≥1,000 random calls (NFR-COR-002) | `unit` | — | — | ⬜ |
| Failing `reserve` leaves no trace (NFR-COR-003, NFR-COR-004) | `unit` | — | — | ⬜ |
| All Phase 1 tests still green, unchanged except where `ship` semantics are the subject | `unit` | — | — | ⬜ |
| README examples and error table pass | `unit` | — | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | — | ⬜ |

**Traceability:** RSV-001..RSV-007, BO-02.
**Workflow:** `.claude/workflows/phase-2-reservations.js` · **Evidence:** `.keel/evidence/phase-2.json`
**ADRs:** ADR-003 (written at generation; Build deviation filled at close)

---

## Phase 3 — History and reorder

**Goal:** every successful change is a movement, and `history`, `setReorderPoint`, `reorderReport` work as specified.

**Scope** (LLD.md §5–§6; ADR-004; PRD F-09..F-11):
- Movement recording across every mutating method (LLD §5), one global `seq` from 1; `history(sku)`.
- `setReorderPoint`, `reorderReport` (sorted by SKU, `suggestedQty = 2 × point − available`).
- README final: all methods, full error table.

**Deliverables:**
- [ ] `src/inventory.js` extended
- [ ] `test/history.test.js` (order, per-line movements, consecutive seq, failed calls consume none)
- [ ] `test/reorder.test.js` (threshold equality, no point = never listed, reserved stock lowers available, sort order, point 0)
- [ ] README + examples final

**Exit gates:**
| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| `node --test` green: movements for every type with `orderId` only on order types; `seq` starts at 1 and is global and gapless | `unit` | — | — | ⬜ |
| Reorder report tests green: at-or-below inclusive, sorted by SKU, unlisted without a point, `suggestedQty` formula | `unit` | — | — | ⬜ |
| `setReorderPoint` rejects negatives, fractions, non-numbers with `invalid_qty`; unknown SKU `not_found` | `unit` | — | — | ⬜ |
| Whole suite green; every error code in LLD §4 has a test (NFR-COR-001) | `unit` | — | — | ⬜ |
| README examples and error table pass | `unit` | — | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | — | ⬜ |

**Traceability:** HST-001..HST-003, ROP-001..ROP-003, BO-01, BO-03.
**Workflow:** `.claude/workflows/phase-3-history-and-reorder.js` · **Evidence:** `.keel/evidence/phase-3.json`
**ADRs:** ADR-004 (written at generation; Build deviation filled at close)

---

## Requirement coverage map

| Requirement group | Phase(s) |
|---|---|
| ITM-xxx, GEN-xxx, SEC-xxx | 1 |
| RSV-xxx | 2 |
| HST-xxx, ROP-xxx | 3 |
| DOC-xxx (tests, README) | 1, 2, 3 (each) |
| BO-01 | 1–3 | 
| BO-02 | 2 |
| BO-03 | 3 |

---

## Deferred items

| Item | Deferred from | Reason | Owner | Revisit trigger | Target | Status |
|---|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — | — |

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
| `.claude/workflows/change-template.js` | Hotfix-weight Change unit (`/keel change <slug>`) |
| `.claude/workflows/phase-1-items-and-stock.js` | Phase 1: setup → parallel worktree tasks → integrate → verify → doc-sync → merge |
| `.claude/workflows/phase-2-reservations.js` | Phase 2, same stages |
| `.claude/workflows/phase-3-history-and-reorder.js` | Phase 3, same stages |

---

*End of IMPLEMENTATION_PLAN.md — inventory*
