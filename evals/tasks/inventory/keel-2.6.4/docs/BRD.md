# Business Requirements — inventory

**Tier:** Product / MVP · **Date:** 2026-11-17 · **Transcript:** [keel-transcript.md](keel-transcript.md)

## 1. Problem and objectives

Orders are promised against stock already promised to other orders, and nobody knows when to reorder. `inventory` is the stock-keeping library a later warehouse app imports: stock on hand, reservations, movement history, reorder suggestions. Stock errors cost money, so every rule must hold exactly as specified.

| ID | Objective | Measure |
|---|---|---|
| BO-01 | Never promise stock that is already promised | `available` = on hand − reserved; `reserve` is all-or-nothing (RSV-003); reserved stock is never shipped twice (RSV-010) |
| BO-02 | Staff know when to reorder | `reorderReport` lists every item at or below its reorder point with a suggested quantity (ROR-003..006) |
| BO-03 | Every rule holds exactly as specified, with the stated error codes | Each error code in §3 is proven by a test (NFR-COR-001) |

## 2. Users

Developers building the warehouse app on this library (primary). Warehouse staff are later end users of that app, not of this library. See [PRD.md](PRD.md).

## 3. Business requirements

Every broken rule throws `InventoryError` with `code` set to the name in brackets. Priority is `Must` for all rows: the founder confirmed the whole specification as required. Phase = [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

### STK — items and stock (Phase 1)

| ID | Requirement | Code | Phase |
|---|---|---|---|
| STK-001 | `src/inventory.js` exports `createInventory()` and the error class `InventoryError` (has a `code` property) | — | 1 |
| STK-002 | `addItem({ sku, name })`: `sku` matches `ABC-1234` (three capital letters, dash, four digits) | `invalid_sku` | 1 |
| STK-003 | `addItem`: `name` is a non-empty string | `invalid_input` | 1 |
| STK-004 | A SKU can be added once | `duplicate_sku` | 1 |
| STK-005 | `receive(sku, qty)` adds `qty` to stock on hand | — | 1 |
| STK-006 | `ship(sku, qty)` removes `qty` from stock on hand | — | 1 |
| STK-007 | `ship` never takes stock below zero | `insufficient_stock` | 1 |
| STK-008 | `stock(sku)` returns the quantity on hand | — | 1 |
| STK-009 | Quantities are positive integers | `invalid_qty` | 1 |
| STK-010 | An unknown SKU is rejected | `not_found` | 1 |

### RSV — reservations (Phase 2)

| ID | Requirement | Code | Phase |
|---|---|---|---|
| RSV-001 | `reserve(orderId, lines)`: `orderId` matches `ORD-` followed by digits | `invalid_order` | 2 |
| RSV-002 | `lines` is a non-empty array of `{ sku, qty }` | see A-04 | 2 |
| RSV-003 | All or nothing: if any line cannot be covered by the available quantity, nothing is reserved | `insufficient_stock` | 2 |
| RSV-004 | An order id that already holds a reservation is rejected | `duplicate_order` | 2 |
| RSV-005 | `available(sku)` = stock on hand − quantity reserved | — | 2 |
| RSV-006 | `release(orderId)` drops the reservation | `not_found` (unknown or closed order) | 2 |
| RSV-007 | `fulfil(orderId)` ships every line of the reservation (stock on hand goes down) and closes it | `not_found` (as RSV-006) | 2 |
| RSV-008 | `release` and `fulfil` close the order: a second call on it is `not_found` | `not_found` | 2 |
| RSV-009 | From Phase 2, `ship(sku, qty)` may only use the available quantity, never reserved stock | `insufficient_stock` | 2 |
| RSV-010 | Reserved stock is never shipped twice (success criterion): on hand ≥ reserved for every SKU at all times | — | 2 |

### HIS — history (Phase 3)

| ID | Requirement | Phase |
|---|---|---|
| HIS-001 | Every successful change records a movement `{ seq, sku, type, qty }` | 3 |
| HIS-002 | `type` is one of `receive`, `ship`, `reserve`, `release`, `fulfil` | 3 |
| HIS-003 | Order operations record one movement per line, with `orderId` | 3 |
| HIS-004 | `seq` is one counter for the whole inventory, starting at 1 | 3 |
| HIS-005 | `history(sku)` returns that SKU's movements, oldest first | 3 |
| HIS-006 | A failed call records nothing and consumes no `seq` | 3 |

### ROR — reorder (Phase 3)

| ID | Requirement | Code | Phase |
|---|---|---|---|
| ROR-001 | `setReorderPoint(sku, n)` stores the item's reorder point | — | 3 |
| ROR-002 | `n` is an integer of 0 or more | `invalid_qty` | 3 |
| ROR-003 | `reorderReport()` lists items whose available quantity is at or below their reorder point | — | 3 |
| ROR-004 | The report is sorted by SKU | — | 3 |
| ROR-005 | Each entry is `{ sku, available, reorderPoint, suggestedQty }`, `suggestedQty` = 2 × reorderPoint − available | — | 3 |
| ROR-006 | Items without a reorder point are never listed | — | 3 |

### SEC / DEL — cross-cutting

| ID | Requirement | Phase |
|---|---|---|
| SEC-001 | Validate every input; never trust caller-supplied ids | 1–3 |
| DEL-001 | Each phase ends with its tests (`node --test`) and README updated before the next phase starts | 1–3 |
| DEL-002 | README says how to use the library and how to run the tests | 1–3 |

## 4. Constraints

| ID | Constraint | Source |
|---|---|---|
| CON-001 | Node.js 20 or later; standard library only (no npm dependencies); ES modules | Founder description |
| CON-002 | Pure in-memory logic: no persistence, no I/O | Founder description |
| CON-003 | Module API only: no UI, no HTTP, no CLI | Interview: Interface |
| CON-004 | Exactly three phases, one per working session, each finished (tests, README) before the next starts | Interview: Phases |
| CON-005 | Tests use `node:test`, runnable with `node --test` | Founder description |

## 5. Assumptions

Each row is a founder answer, an ADR, or `unvalidated`. Open ones are in [adr/README.md](adr/README.md) Open decisions.

| ID | Assumption | Source |
|---|---|---|
| A-01 | The data is SKUs, item names, quantities and order ids; nothing sensitive; no compliance regime applies | Interview: Data, Compliance |
| A-02 | Unknown SKU is `not_found` on every call that takes a SKU, whatever its format | [ADR-002](adr/ADR-002-error-contract.md) |
| A-03 | `release`/`fulfil` on an id that holds no reservation is `not_found`, even if the id is malformed | [ADR-002](adr/ADR-002-error-contract.md) |
| A-04 | `lines` that is not an array, or is empty, throws `invalid_input` | OD-03, unvalidated |
| A-05 | A closed order id may be reused: only an id that currently holds a reservation is `duplicate_order` | OD-02, unvalidated |
| A-06 | `name` is accepted as given: no trimming, so whitespace-only passes | OD-01, unvalidated |
| A-07 | The same SKU on two lines of one order is allowed; coverage is checked on the summed quantity | OD-04, unvalidated |
| A-08 | A `receive` that would push stock past `Number.MAX_SAFE_INTEGER` throws `invalid_qty` | OD-05, unvalidated |
| A-09 | No performance target: a small warehouse, in-memory, per-call work proportional to the lines or movements touched | unvalidated |
| A-10 | Argument validation (`invalid_*`) runs before state checks (`duplicate_*`, `not_found`, `insufficient_stock`) | [ADR-002](adr/ADR-002-error-contract.md) |
| A-11 | Mutators' return values are unspecified; `receive`/`ship` return the new on-hand quantity, the others return `undefined` | [LLD.md](LLD.md) §9, unvalidated |

## 6. Out of scope

Persistence, concurrency across processes, multi-warehouse or locations, units of measure, prices, UI/HTTP/CLI, partial reservations, partial fulfilment, editing or removing items, un-receiving stock. A caller needing any of these is a new phase.

## 7. Risks

| ID | Risk | Mitigation |
|---|---|---|
| RSK-001 | Reserved stock is shipped, or reserved twice (the core business failure) | RSV-003, RSV-009, RSV-010; property test NFR-COR-002 |
| RSK-002 | A failed call leaves partial state (half a reservation, a consumed `seq`) | Validate-then-commit: [ADR-003](adr/ADR-003-validate-then-commit.md); NFR-COR-003 |
| RSK-003 | An ambiguous rule resolved wrongly by the builder | A-02..A-08 are marked and listed as open decisions for the founder |
| RSK-004 | Caller mutates returned data and corrupts state | Returned values are copies: [ADR-003](adr/ADR-003-validate-then-commit.md); NFR-SEC-002 |
