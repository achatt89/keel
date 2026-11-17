# Engineering Design — inventory

Bridge from [BRD.md](BRD.md) to code. Product tier, small surface: pillars and non-negotiables only.

## 1. Design pillars

| # | Pillar | Why |
|---|---|---|
| 1 | Correctness over convenience: strict inputs, exact error codes | BO-03; stock errors cost money |
| 2 | Atomic calls: a call fully succeeds or changes nothing | RSK-002 |
| 3 | Plain and dependency-free | CON-001; [ADR-001](adr/ADR-001-runtime-and-test-stack.md) |

## 2. Data classification

All data is `C0` (public/non-sensitive): SKUs, names, quantities, order ids (BRD A-01). No `C1`–`C3` data exists.

## 3. Non-negotiables

| # | Rule | Source |
|---|---|---|
| NN-1 | Every broken rule throws `InventoryError` with the specified `code`; no other error type escapes for a rule violation | STK-001, [ADR-002](adr/ADR-002-error-contract.md) |
| NN-2 | Every input is validated before any state is read or changed; caller-supplied ids and values are never trusted | SEC-001, [ADR-003](adr/ADR-003-validate-then-commit.md) |
| NN-3 | A failed call changes nothing: no stock, no reservation, no movement, no `seq` | HIS-006, RSV-003 |
| NN-4 | On hand ≥ reserved for every SKU at all times; `ship` and `reserve` use `available` only (from Phase 2) | RSV-009, RSV-010 |
| NN-5 | State is private to one `createInventory()` instance; returned values are copies; inputs are never retained or mutated | SEC-001, NFR-SEC-002 |
| NN-6 | No runtime dependencies, no I/O, no globals | CON-001, CON-002 |

## 4. Decomposition and build order

One module, `src/inventory.js` ([LLD.md](LLD.md) §1). Build order follows [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md): items and stock → reservations → history and reorder. Rationale: each phase only adds state that the previous one defines (reservations need stock; movements need every operation to exist).
