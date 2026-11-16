# inventory — Business Requirements (BRD)

**Status:** Draft v0.1 · 2026-11-16 · Tier: Product / MVP · Decider: founder

## 1. Problem

A small warehouse promises orders against stock that is already promised to other orders, and nobody knows when to reorder. `inventory` is the stock-keeping library a later warehouse app is built on. It gives developers one place where the stock rules live, so the app cannot break them.

## 2. Users

| User | Relationship | Needs |
|---|---|---|
| Developer (builds the warehouse app) | Direct — imports the library | Exact, documented rules; stable error codes; no dependencies |
| Warehouse staff | Indirect — through the later app | Correct stock figures; no double promises; a reorder list |

## 3. Business objectives

| ID | Objective | Measure |
|---|---|---|
| BO-01 | No order is promised stock already promised elsewhere | Every reservation rule holds in tests (RSV-001..008) |
| BO-02 | Reserved stock is never shipped twice | `ship` cannot use reserved quantity; `fulfil` consumes the reservation once (RSV-006, RSV-007) |
| BO-03 | Staff know when to reorder | `reorderReport` lists exactly the items at or below their reorder point (ROP-001..005) |
| BO-04 | Developers can rely on failures | Every broken rule throws `InventoryError` with the specified `code` (ERR-001..002) |

## 4. Requirements

Priority is MoSCoW; every row is `Must` because the founder confirmed the whole specification as required. Phase = [IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md).

### 4.1 Items — `ITM`

| ID | Requirement | Error | Phase |
|---|---|---|---|
| ITM-001 | `addItem({ sku, name })` registers an item with zero stock | — | 1 |
| ITM-002 | `sku` matches `ABC-1234`: three capital letters, a dash, four digits | `invalid_sku` | 1 |
| ITM-003 | `name` is a non-empty string | `invalid_input` | 1 |
| ITM-004 | A SKU can be added once | `duplicate_sku` | 1 |

### 4.2 Stock — `STK`

| ID | Requirement | Error | Phase |
|---|---|---|---|
| STK-001 | Quantities are positive integers | `invalid_qty` | 1 |
| STK-002 | An unknown SKU is rejected by every operation that takes one | `not_found` | 1 |
| STK-003 | `receive(sku, qty)` adds `qty` to stock on hand | — | 1 |
| STK-004 | `ship(sku, qty)` removes `qty` from stock on hand, never below zero | `insufficient_stock` | 1 |
| STK-005 | `stock(sku)` returns the quantity on hand | — | 1 |

### 4.3 Reservations — `RSV`

| ID | Requirement | Error | Phase |
|---|---|---|---|
| RSV-001 | `orderId` matches `ORD-` followed by digits | `invalid_order` | 2 |
| RSV-002 | `lines` is a non-empty array of `{ sku, qty }` | `invalid_input` [ASSUMPTION: code not given by founder] | 2 |
| RSV-003 | `reserve` is all or nothing: if any line cannot be covered by the available quantity, nothing is reserved | `insufficient_stock` | 2 |
| RSV-004 | An order id that already holds a reservation cannot reserve again | `duplicate_order` | 2 |
| RSV-005 | `available(sku)` = stock on hand − quantity reserved | — | 2 |
| RSV-006 | From Phase 2 on, `ship` may use only the available quantity | `insufficient_stock` | 2 |
| RSV-007 | `fulfil(orderId)` ships every line (stock on hand goes down) and closes the reservation | `not_found` if unknown or closed | 2 |
| RSV-008 | `release(orderId)` drops the reservation | `not_found` if unknown or closed | 2 |

### 4.4 History — `MOV`

| ID | Requirement | Phase |
|---|---|---|
| MOV-001 | Every successful change records a movement `{ seq, sku, type, qty }`; order movements add `orderId` | 3 |
| MOV-002 | `type` is `receive`, `ship`, `reserve`, `release` or `fulfil`; order operations record one movement per line | 3 |
| MOV-003 | `seq` is one counter for the whole inventory, starting at 1 | 3 |
| MOV-004 | `history(sku)` returns that SKU's movements, oldest first | 3 |

### 4.5 Reorder — `ROP`

| ID | Requirement | Error | Phase |
|---|---|---|---|
| ROP-001 | `setReorderPoint(sku, n)`: `n` is an integer of 0 or more | `invalid_qty` | 3 |
| ROP-002 | `reorderReport()` lists items whose available quantity is at or below their reorder point | — | 3 |
| ROP-003 | Sorted by SKU; each entry is `{ sku, available, reorderPoint, suggestedQty }` | — | 3 |
| ROP-004 | `suggestedQty` = 2 × reorderPoint − available | — | 3 |
| ROP-005 | Items without a reorder point are never listed | — | 3 |

### 4.6 Errors and delivery — `ERR`, `DLV`

| ID | Requirement | Phase |
|---|---|---|
| ERR-001 | `src/inventory.js` exports `createInventory()` and the class `InventoryError` | 1 |
| ERR-002 | Every broken rule throws `InventoryError` whose `code` is the specified name | 1–3 |
| DLV-001 | Tests runnable with `node --test`, written with the code | 1–3 |
| DLV-002 | `README.md` states how to use the library and run the tests; finished each phase | 1–3 |

## 5. Constraints

| ID | Constraint |
|---|---|
| CON-001 | Node.js 20 or later; standard library only (no npm dependencies); ES modules |
| CON-002 | Pure in-memory logic; no persistence, I/O, UI, HTTP or CLI |
| CON-003 | Three phases, in the order given, one per working session; each finished (tests, README) before the next starts |
| CON-004 | One developer building with Claude Code |

## 6. Assumptions

| ID | Assumption | Validate by |
|---|---|---|
| A-01 | Behaviours the founder spec leaves open follow the defaults in [ADR-002](./adr/ADR-002-error-model-and-validation-order.md) and [LLD](./LLD.md); each is marked `[ASSUMPTION]` where it applies | Founder review of [Open decisions](./adr/README.md#open-decisions) |
| A-02 | A single caller thread uses an inventory; the API is synchronous, so no locking exists | Revisit if the app shares an inventory across async work that interleaves mid-operation (it cannot: every method is synchronous) |
| A-03 | Data holds nothing sensitive (SKUs, names, quantities, order ids) | Revisit if the app adds customer data |

## 7. Out of scope

Persistence, multi-warehouse, locations/bins, units of measure, pricing, item deletion or renaming, un-receiving, UI, HTTP, CLI, deployment. Each would need a new phase and its own requirement IDs.

## 8. Risks

| ID | Risk | Mitigation | Owner |
|---|---|---|---|
| RSK-001 | Partial reservation leaves stock half-promised | Validate-then-commit; atomicity test ([ADR-003](./adr/ADR-003-validate-then-commit-atomicity.md)) | engineering |
| RSK-002 | Caller mutates input arrays or returned data and corrupts state | Copy at every boundary ([ADR-005](./adr/ADR-005-defensive-copies-at-boundaries.md)) | engineering |
| RSK-003 | Spec gaps are filled by guesswork | Every gap is an `[ASSUMPTION]` and an Open decision; founder resolves | founder |
| RSK-004 | In-memory state is lost on exit | Accepted: persistence is out of scope (CON-002); the app owns it | founder |
| RSK-005 | Reusing a closed order id could let a caller re-reserve and re-fulfil | Open decision OD-01 | founder |
