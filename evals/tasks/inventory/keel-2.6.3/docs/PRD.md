# Product Requirements — inventory

Implements [BRD](./BRD.md). The product is a module API; "UI" is the function signatures in [LLD §2](./LLD.md).

## 1. Personas

| Persona | Need |
|---|---|
| **App developer** (primary) | Import `createInventory()`, call methods, trust the error codes to drive app logic. |
| **Warehouse staff** (later, via the app) | Never be promised stock that is gone; see what to reorder. |

## 2. Journeys

1. Developer: `addItem` → `receive` → `stock`.
2. Order desk: `reserve(order, lines)` → `available` → `fulfil` (or `release`); `ship` for non-order outbound.
3. Buyer: `setReorderPoint` per SKU → `reorderReport()` → purchase order of `suggestedQty`.

## 3. Features

| ID | Feature | Priority | Acceptance | BRD | Phase |
|---|---|---|---|---|---|
| F-01 | `addItem({ sku, name })` | Must | Valid pair stores item with 0 stock; bad sku → `invalid_sku`; bad name → `invalid_input`; repeat sku → `duplicate_sku` | ITM-001..003 | 1 |
| F-02 | `receive(sku, qty)` | Must | stock += qty; qty not positive integer → `invalid_qty`; unknown → `not_found` | STK-001, 004, 005 | 1 |
| F-03 | `ship(sku, qty)` | Must | stock −= qty; below zero → `insufficient_stock` | STK-002, 004, 005 | 1 |
| F-04 | `stock(sku)` | Must | returns on-hand; unknown → `not_found` | STK-003, 005 | 1 |
| F-05 | `reserve(orderId, lines)` | Must | all-or-nothing; `invalid_order`, `duplicate_order`, `insufficient_stock`; nothing changes on failure | RSV-001..004 | 2 |
| F-06 | `available(sku)` | Must | on hand − reserved | RSV-005 | 2 |
| F-07 | `release(orderId)` | Must | reservation dropped; unknown/closed → `not_found` | RSV-006 | 2 |
| F-08 | `fulfil(orderId)` | Must | every line shipped, order closed; unknown/closed → `not_found` | RSV-007 | 2 |
| F-09 | `ship` limited to available | Must | reserved stock cannot be shipped → `insufficient_stock` | RSV-008 | 2 |
| F-10 | Movement recording | Must | one movement per change (per line for orders), global `seq` from 1 | HST-001, 002 | 3 |
| F-11 | `history(sku)` | Must | that SKU's movements, oldest first | HST-003 | 3 |
| F-12 | `setReorderPoint(sku, n)` | Must | integer ≥ 0 else `invalid_qty` | ROP-001 | 3 |
| F-13 | `reorderReport()` | Must | available ≤ point, sorted by SKU, `suggestedQty = 2×point − available`; no point → not listed | ROP-002, 003 | 3 |

## 4. Non-goals

See BRD §5. Roadmap = the three phases in [IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md); anything after Phase 3 is a new `/keel phase new`.

## 5. Product success

BO-03: the test suite proves every row in BRD §2 with its exact code; BO-01: the invariant test (NFR-COR-002) never finds reserved stock shipped.
