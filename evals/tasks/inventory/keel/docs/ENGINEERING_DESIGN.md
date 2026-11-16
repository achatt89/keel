# inventory — Engineering Design

**Status:** Draft v0.1 · 2026-11-16 · Inputs: [BRD](./BRD.md), [PRD](./PRD.md)

## 1. Pillars

| # | Pillar | Why |
|---|---|---|
| 1 | Correctness over convenience | Stock errors cost money (BO-01, BO-02) |
| 2 | Every failure is an `InventoryError` with a stable `code` | Callers branch on codes (BO-04) |
| 3 | No partial effects | A failed call changes nothing, records nothing (RSK-001) |
| 4 | Zero dependencies, standard library only | CON-001 |

## 2. Domain model

| Concept | Definition |
|---|---|
| Item | `{ sku, name }`; created once, never removed |
| On hand | Integer ≥ 0 per SKU |
| Reserved | Sum of open reservation lines per SKU |
| Available | On hand − reserved; always ≥ 0 |
| Reservation | Open order: `orderId` → list of `{ sku, qty }` lines; closed by `release` or `fulfil` |
| Movement | `{ seq, sku, type, qty }` (+ `orderId` for order movements); append-only |
| Reorder point | Optional integer ≥ 0 per SKU |

Derived identity that must always hold: `0 ≤ reserved(sku) ≤ onHand(sku)` for every SKU.

## 3. Data classification

| Tier | Data here | Handling |
|---|---|---|
| C0 | SKUs, item names, quantities, order ids | Public-grade; in memory only; never logged by the library |

No C1–C3 data. Compliance doc omitted (see [docs/README](./README.md)).

## 4. Non-negotiables

| # | Rule | Source |
|---|---|---|
| NN-1 | Validate every input before any state change; never trust a caller-supplied id, array, object or number | NFR-SEC-001 |
| NN-2 | Validate-then-commit: all checks run first; the commit step cannot throw | [ADR-003](./adr/ADR-003-validate-then-commit-atomicity.md) |
| NN-3 | Only `InventoryError` escapes for rule violations; every error carries a spec-named `code` | [ADR-002](./adr/ADR-002-error-model-and-validation-order.md) |
| NN-4 | `ship` and `reserve` check the **available** quantity, never on-hand alone (from Phase 2) | RSV-006 |
| NN-5 | Copy at every boundary: stored lines, returned movements and reports are copies | [ADR-005](./adr/ADR-005-defensive-copies-at-boundaries.md) |
| NN-6 | One `seq` counter per inventory; consumed only by a successful movement | MOV-003 |
| NN-7 | Standard library only; ES modules; no I/O, timers, globals or randomness | CON-001, CON-002 |
| NN-8 | Per-inventory state only; two `createInventory()` results share nothing | ARCHITECTURE §3 |

## 5. Decomposition

One module, `src/inventory.js`; internal sections in [LLD](./LLD.md). Structure and flow: [ARCHITECTURE](./ARCHITECTURE.md).

## 6. Build order

Phase 1 → 2 → 3 ([IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md)). Each phase adds methods without changing earlier signatures; the one behavioural change (`ship` uses available) lands in Phase 2 and is a no-op while nothing is reserved.
