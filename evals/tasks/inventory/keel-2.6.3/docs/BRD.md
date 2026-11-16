# Business Requirements — inventory

**Tier:** Product / MVP · **Status:** Accepted at generation · Source: [keel-transcript](./keel-transcript.md)

## 1. Problem and objectives

Orders are promised against stock already promised to other orders, and nobody knows when to reorder. `inventory` is the stock-keeping library a small warehouse's app is built on. Users are the developers who build that app; warehouse staff are the later end users.

| ID | Objective |
|---|---|
| BO-01 | Reserved stock is never shipped twice; no order is promised stock that is already promised. |
| BO-02 | The warehouse learns when and how much to reorder (reorder report). |
| BO-03 | Every rule holds exactly as specified, with the stated error code. (Success metric.) |

## 2. Business requirements

Priority is `Must` for all: the founder confirmed every line of the specification. Phase = [IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md).

| ID | Requirement | Error code | Phase | Feature |
|---|---|---|---|---|
| ITM-001 | `addItem` requires `sku` matching `ABC-1234` (3 capital letters, dash, 4 digits) | `invalid_sku` | 1 | F-01 |
| ITM-002 | `addItem` requires `name` a non-empty string | `invalid_input` | 1 | F-01 |
| ITM-003 | A SKU can be added once | `duplicate_sku` | 1 | F-01 |
| STK-001 | `receive(sku, qty)` adds `qty` to stock on hand | — | 1 | F-02 |
| STK-002 | `ship(sku, qty)` removes `qty` from stock on hand, never below zero | `insufficient_stock` | 1 | F-03 |
| STK-003 | `stock(sku)` returns the quantity on hand | — | 1 | F-04 |
| STK-004 | Every quantity is a positive integer | `invalid_qty` | 1 | F-02, F-03 |
| STK-005 | An unknown SKU is rejected | `not_found` | 1 | F-02..F-04 |
| RSV-001 | `reserve` requires `orderId` matching `ORD-` and digits | `invalid_order` | 2 | F-05 |
| RSV-002 | `reserve` requires `lines` a non-empty array of `{ sku, qty }` | see [ASSUMPTION] A-04 | 2 | F-05 |
| RSV-003 | `reserve` is all-or-nothing: any line not covered by the available quantity reserves nothing | `insufficient_stock` | 2 | F-05 |
| RSV-004 | An order id that already holds a reservation is rejected | `duplicate_order` | 2 | F-05 |
| RSV-005 | `available(sku)` = stock on hand − quantity reserved | — | 2 | F-06 |
| RSV-006 | `release(orderId)` drops the reservation; unknown or closed order rejected | `not_found` | 2 | F-07 |
| RSV-007 | `fulfil(orderId)` ships every reserved line (stock down) and closes the order; unknown or closed rejected | `not_found` | 2 | F-08 |
| RSV-008 | From phase 2 on, `ship` may use only the available quantity, never reserved stock | `insufficient_stock` | 2 | F-09 |
| HST-001 | Every successful change records a movement `{ seq, sku, type, qty }` (+ `orderId` for order movements); `type` ∈ receive, ship, reserve, release, fulfil; one movement per line for order operations | — | 3 | F-10 |
| HST-002 | `seq` is one counter for the whole inventory, starting at 1 | — | 3 | F-10 |
| HST-003 | `history(sku)` returns that SKU's movements, oldest first | `not_found` (A-07) | 3 | F-11 |
| ROP-001 | `setReorderPoint(sku, n)` requires `n` an integer ≥ 0 | `invalid_qty` | 3 | F-12 |
| ROP-002 | `reorderReport()` lists items with available ≤ reorder point, sorted by SKU, as `{ sku, available, reorderPoint, suggestedQty }`; `suggestedQty` = 2 × reorderPoint − available | — | 3 | F-13 |
| ROP-003 | Items without a reorder point are never listed | — | 3 | F-13 |
| ERR-001 | Every broken rule throws `InventoryError` whose `code` is the name above | all | 1–3 | all |
| ERR-002 | Every input is validated; caller-supplied ids are never trusted | all | 1–3 | all |

## 3. Constraints

| ID | Constraint |
|---|---|
| CON-001 | Node.js 20+, standard library only, no npm dependencies. |
| CON-002 | Pure in-memory logic; no persistence, I/O, network, UI, HTTP or CLI. |
| CON-003 | ES modules; entry `src/inventory.js` exports `createInventory()` and `InventoryError`. |
| CON-004 | Exactly three phases, in order, one per working session; each finished (tests, README) before the next starts. |
| CON-005 | Tests use `node:test`, run with `node --test`; a README documents usage and tests. |

## 4. Assumptions

Each is also marked `[ASSUMPTION]` where used. Confirm or correct; closing one with a founder call becomes an ADR.

| ID | Assumption |
|---|---|
| A-01 | `receive`/`ship`/`stock`/`setReorderPoint` do not format-check the SKU; any SKU not added is `not_found`. |
| A-02 | Validation order per call: argument shape (`invalid_qty`, `invalid_input`, `invalid_order`) → existence (`not_found`) → state (`duplicate_*`, `insufficient_stock`). See [LLD §4](./LLD.md). |
| A-03 | A closed (released or fulfilled) order id may be reserved again; `duplicate_order` applies only while a reservation is open. (OD-01) |
| A-04 | `reserve` with `lines` not a non-empty array, or a line not an object, throws `invalid_input`; a bad line `qty` throws `invalid_qty`; an unknown line SKU throws `not_found`. |
| A-05 | Two lines for the same SKU in one `reserve` are legal; coverage is checked against their sum; one movement is recorded per line. |
| A-06 | `name` that is empty after trimming is invalid; the stored name is the trimmed value. |
| A-07 | `history(sku)` and `setReorderPoint` for an unknown SKU throw `not_found`; `history` of a known SKU with no movements is `[]`. |
| A-08 | Mutators return `undefined` except `addItem`, which returns `{ sku, name }`; callers get copies, never internal objects. |
| A-09 | Malformed `orderId` passed to `release`/`fulfil` throws `not_found` (nothing can be held under it). |
| A-10 | Quantities and stock stay safe integers; a `receive` that would exceed `Number.MAX_SAFE_INTEGER` throws `invalid_qty`. |
| A-11 | No numeric performance target: small-warehouse scale; operations are O(lines) and the report O(n log n). |

## 5. Out of scope

Persistence, multi-warehouse, locations/bins, units of measure, cost/price, backorders, partial fulfilment, editing or deleting items, partial release, an HTTP/CLI/UI layer, concurrency across processes, i18n of error messages.

## 6. Risks

| ID | Risk | Mitigation |
|---|---|---|
| RSK-001 | Reserved stock shipped twice (BO-01) through a second code path that skips the available check | One internal `commit` path; `ship` and `fulfil` share the stock-decrease helper ([ADR-003](./adr/ADR-003-reservation-model.md)); invariant test NFR-COR-002 |
| RSK-002 | A failed call leaves partial state or burns a `seq` | Validate-all-then-apply ([ADR-002](./adr/ADR-002-error-model-and-atomicity.md)); NFR-COR-001 |
| RSK-003 | Assumptions A-01..A-11 differ from the founder's intent | Listed in OD register ([adr/README](./adr/README.md)); cheap to change in Phase 1–3 |
| RSK-004 | In-memory only: state is lost on restart | Accepted for v1 (CON-002); revisit when a persistence need appears |
