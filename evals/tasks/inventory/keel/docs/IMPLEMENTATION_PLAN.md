# inventory — Implementation Plan

**Version:** 0.1 · **Status:** Draft, nothing built · **References:** [BRD](./BRD.md), [ENGINEERING_DESIGN](./ENGINEERING_DESIGN.md), [ARCHITECTURE](./ARCHITECTURE.md), [LLD](./LLD.md), [NFR](./NFR.md), [ADRs](./adr/README.md)

## How to read this plan

Three phases, exactly the founder's, in order, **one per working session**. A phase is finished (code, tests, README, doc-sync) before the next starts (CON-003). There is no separate guardrails phase: the library has no CI or lint to stand up, so the package scaffold is the first task of Phase 1 [ASSUMPTION]. Phase 3 is the launchable line: the library is complete when it closes. A Change (`CHG-xxx`) is hotfix-weight work with no gate; phases are never renumbered.

### Phase status

| Phase | Status | Deploy state | Exit gate (one line) | Evidence | Last update |
|---|---|---|---|---|---|
| 1 — Items and stock | ⬜ | — | Items/stock rules and codes proven by `node --test`; README usage + test instructions written | — | — |
| 2 — Reservations | ⬜ | — | Reservations all-or-nothing; reserved stock never shipped twice; Phase 1 suite still green | — | — |
| 3 — History and reorder | ⬜ | — | Global `seq` history and reorder report proven; README complete | — | — |

Deploy state does not apply to a library with no deployment: the ladder stops at `merged` (see [CHANGELOG](../CHANGELOG.md)) [ASSUMPTION].

### Standing rules

- **Workflow-first, branch-per-phase.** Run `claude --workflow .claude/workflows/phase-N-<slug>.js`. The script makes `phase-N-<slug>` off `main`, fans tasks out to separate `git worktree`s, integrates, verifies, runs doc-sync, merges. Never commit to `main` directly.
- **Goal-directed, self-contained tasks.** Each task agent opens with `/goal` (code done, tests pass, behaviour exercised end to end). Exit strategy when stuck: **bounded retries, then escalate** [ASSUMPTION — founder gave no preference]: up to 3 fix-and-retest cycles, then `/goal clear`, commit what works, add a Deferred items row stating what blocks.
- **Tests ship with the code.** Every rule and error code is proven by a `node --test` test that asserts `error.code`. No test is skipped.
- **Doc sync is mandatory before merge** (`.claude/workflows/doc-sync.js`): status table, this plan, ADRs, CHANGELOG `[Unreleased]`, budgets.
- **README is a deliverable of every phase**, not a final chore: it documents exactly the API that exists at phase close and how to run the tests.
- **Decisions captured without fail.** A decision made in work becomes an ADR before merge (next free number taken at Integrate). Spec gaps never get silently filled: record an `[ASSUMPTION]` and an Open decision.
- **Definition of done per PR:** `node --test` green · every in-scope requirement ID named by a test · README matches the API · no new dependency · doc-sync commit present.
- **Claims carry evidence.** `✅` needs a level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact. This library can reach `unit` and `integration` (tests across methods); `staging`/`prod-live` do not exist for it.

---

## Phase 1 — Items and stock

**Goal:** a caller can add items and receive, ship and read stock; every Phase 1 rule fails with its exact `InventoryError` code.

**Scope** ([BRD §4.1–4.2](./BRD.md#41-items--itm), §4.6; [LLD](./LLD.md) §1–§4; ADR-001, 002, 003, 005):
- Package scaffold: `package.json` (ESM, `engines >=20`, no dependencies, `npm test` = `node --test`), `src/inventory.js`, `test/`.
- `InventoryError` and shared validators.
- `addItem`, `receive`, `ship`, `stock`.
- README: usage and how to run tests, for Phase 1 methods.

**Deliverables:**
- [ ] `src/inventory.js` exporting exactly `createInventory`, `InventoryError`
- [ ] `test/items-stock.test.js`, plus `test/build.test.js` for NFR-BLD-001/002
- [ ] `README.md` (Phase 1 API, error-code table, test command)

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| `node --test` green; ITM-001..004, STK-001..005, ERR-001..002 each named by a test | `unit` | — | — | ⬜ |
| Bad-input table tests per method (NFR-SEC-001, 002, 004, 006) and failed-call-changes-nothing (NFR-COR-002) | `unit` | — | — | ⬜ |
| No dependencies, ESM, `node:` imports only (NFR-BLD-001..002) | `unit` | — | — | ⬜ |
| README states usage and test command; a reader can run the suite from it (NFR-TST-003) | `code-read` | — | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** ITM, STK, ERR, DLV · BO-04.
**Workflow:** `.claude/workflows/phase-1-items-and-stock.js` · **Evidence:** `.keel/evidence/phase-1.json`
**ADRs reserved at scope:** none new (ADR-001, 002, 003, 005 govern; unplanned decisions take the next free number at Integrate).

---

## Phase 2 — Reservations

**Goal:** orders reserve stock all-or-nothing, `ship` can no longer touch reserved stock, and `fulfil`/`release` close reservations exactly once.

**Scope** ([BRD §4.3](./BRD.md#43-reservations--rsv); [LLD](./LLD.md) §4–§5; ADR-004):
- `reserve`, `available`, `release`, `fulfil`.
- `ship` checks available quantity (RSV-006); all Phase 1 tests stay green.
- README: Phase 2 API and the reserved-vs-available explanation.

**Deliverables:**
- [ ] `test/reservations.test.js` (journeys J-2..J-5)
- [ ] README updated

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| RSV-001..008 each named by a passing test; whole suite green | `unit` | — | — | ⬜ |
| Atomicity: a `reserve` with a failing later line changes nothing (NFR-COR-002) | `unit` | — | — | ⬜ |
| Invariant `0 ≤ reserved ≤ onHand` holds over a seeded random-operation test (NFR-COR-001) | `integration` | — | — | ⬜ |
| Reserved stock never shipped twice: reserve → ship blocked → fulfil → second fulfil `not_found` (NFR-COR-003) | `integration` | — | — | ⬜ |
| Caller mutation of `lines` after `reserve` changes nothing (NFR-SEC-003) | `unit` | — | — | ⬜ |
| README matches the Phase 2 API | `code-read` | — | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** RSV · BO-01, BO-02.
**Workflow:** `.claude/workflows/phase-2-reservations.js` · **Evidence:** `.keel/evidence/phase-2.json`
**ADRs reserved at scope:** none new (ADR-004 governs).

---

## Phase 3 — History and reorder

**Goal:** every successful change is a movement with a gapless global `seq`, and `reorderReport` tells staff what to reorder.

**Scope** ([BRD §4.4–4.5](./BRD.md#44-history--mov); [LLD](./LLD.md) §6–§7; ADR-006):
- Movement log; every Phase 1–2 mutator records; `history`.
- `setReorderPoint`, `reorderReport`.
- README finished: full API, error-code table, test command.

**Deliverables:**
- [ ] `test/history.test.js`, `test/reorder.test.js` (journeys J-6, J-7)
- [ ] README complete

**Exit gates:**

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| MOV-001..004 and ROP-001..005 each named by a passing test; whole suite green | `unit` | — | — | ⬜ |
| `seq` gapless from 1 across SKUs and order operations; failed calls consume none (NFR-COR-004) | `integration` | — | — | ⬜ |
| Every error code asserted by `error.code` somewhere in the suite (NFR-TST-002) | `unit` | — | — | ⬜ |
| Every BRD §4 requirement ID is named by at least one test (NFR-TST-001) | `integration` | — | — | ⬜ |
| README complete: all methods, codes, usage, test command (NFR-TST-003) | `code-read` | — | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** MOV, ROP · BO-03.
**Workflow:** `.claude/workflows/phase-3-history-and-reorder.js` · **Evidence:** `.keel/evidence/phase-3.json`
**ADRs reserved at scope:** none new (ADR-006 governs). **This is the launch gate** (library complete).

---

## Requirement coverage map

| Requirement group | Phase(s) |
|---|---|
| ITM, STK, ERR, DLV | 1 |
| RSV | 2 |
| MOV, ROP | 3 |
| DLV-001/002 (tests, README) | 1, 2, 3 (each phase) |

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
| `.claude/workflows/doc-sync.js` | Mandatory pre-merge doc sync; budgets; archive/split; prune |
| `.claude/workflows/change-template.js` | `/keel change` hotfix unit |
| `.claude/workflows/phase-1-items-and-stock.js` | Phase 1 — Setup → worktree tasks → Integrate → Verify → doc-sync → merge |
| `.claude/workflows/phase-2-reservations.js` | Phase 2 — same stages |
| `.claude/workflows/phase-3-history-and-reorder.js` | Phase 3 — same stages |

---

*End of IMPLEMENTATION_PLAN.md — inventory*
