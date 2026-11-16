# Engineering Design — inventory

**Status:** Draft · Bridges [BRD.md](./BRD.md) to [ARCHITECTURE.md](./ARCHITECTURE.md) and [LLD.md](./LLD.md).

## 1. Design pillars

| Pillar | Meaning |
|---|---|
| Correctness over convenience | Stock errors cost money (BRD A-02); a rejected call beats a guessed one |
| Atomic or untouched | A call either fully succeeds or changes nothing ([ADR-005](./adr/ADR-005-validate-then-commit.md)) |
| Stable error contract | Callers branch on `InventoryError.code`, never on message text ([ADR-001](./adr/ADR-001-module-shape-and-error-model.md)) |
| Zero dependencies | CON-002; the whole library is auditable in one sitting |

## 2. Core domain model

| Concept | Definition |
|---|---|
| Item | `{ sku, name }` plus on-hand quantity and optional reorder point |
| On hand | Units physically in stock; changed by `receive`, `ship`, `fulfil` |
| Reserved | Sum of open reservation lines for a SKU; changed by `reserve`, `release`, `fulfil` |
| Available | on hand − reserved (RSV-004) |
| Reservation | Open hold keyed by order id; lines `{ sku, qty }`; closed by `release` or `fulfil` |
| Movement | Ledger row `{ seq, sku, type, qty[, orderId] }` ([ADR-004](./adr/ADR-004-movement-ledger.md)) |

## 3. Data classification

All data is class **C0** (public/non-sensitive): SKUs, item names, quantities, order ids (BRD A-03). No `C1`–`C3` data exists; COMPLIANCE is a stub.

## 4. Non-negotiables

| # | Rule | Verified by |
|---|---|---|
| N-1 | on hand ≥ 0 and reserved ≤ on hand for every SKU, after every call | NFR-COR-002 |
| N-2 | Reserved stock is never shipped: `ship` uses available only | NFR-COR-002, RSV-005 |
| N-3 | A throwing call leaves no trace: no stock change, no reservation, no movement, no `seq` consumed | NFR-COR-003 |
| N-4 | Every broken rule throws `InventoryError` with the stated `code`; nothing else escapes for invalid input | NFR-COR-001 |
| N-5 | No caller-owned object is retained; no internal object is returned | NFR-SEC-001 |
| N-6 | No dependencies, no I/O, no timers | NFR-MNT-001 |

## 5. Decomposition and build order

One module (`src/inventory.js`), built in three phases: items and stock, then reservations (changes `ship`), then ledger and reorder. Rationale: each phase leaves a complete, tested, documented library ([IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)).
