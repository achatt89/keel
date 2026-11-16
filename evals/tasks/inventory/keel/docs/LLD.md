# inventory — Low-Level Design

**Status:** Draft v0.1 · 2026-11-16 · Structure: [ARCHITECTURE](./ARCHITECTURE.md) · Rules: [ENGINEERING_DESIGN](./ENGINEERING_DESIGN.md) §4

## 1. Files

| Path | Phase | Content |
|---|---|---|
| `package.json` | 1 | `"type": "module"`, `"engines": { "node": ">=20" }`, `"scripts": { "test": "node --test" }`, no dependencies |
| `src/inventory.js` | 1–3 | Exports `createInventory`, `InventoryError` — and nothing else |
| `test/*.test.js` | 1–3 | `node:test` + `node:assert/strict` |
| `README.md` | 1–3 | Usage, error codes, how to run tests |

## 2. Types (JSDoc-level contract)

| Name | Shape |
|---|---|
| `Sku` | string matching `/^[A-Z]{3}-\d{4}$/` |
| `OrderId` | string matching `/^ORD-\d+$/` |
| `Qty` | safe integer > 0 |
| `ReorderPoint` | safe integer ≥ 0 |
| `Line` | `{ sku: Sku, qty: Qty }` |
| `Movement` | `{ seq: number, sku: Sku, type: 'receive'\|'ship'\|'reserve'\|'release'\|'fulfil', qty: Qty, orderId?: OrderId }` — `orderId` key present only on `reserve`, `release`, `fulfil` |
| `ReorderEntry` | `{ sku, available, reorderPoint, suggestedQty }` |

## 3. `InventoryError`

`class InventoryError extends Error`; constructor `(code, message)`; sets `this.code`, `this.name = 'InventoryError'`. Codes: `invalid_sku`, `invalid_input`, `duplicate_sku`, `invalid_qty`, `not_found`, `insufficient_stock`, `invalid_order`, `duplicate_order`. Messages name the failing field, never embed caller objects (NFR-SEC-005).

## 4. Public API

Check order inside every method is: **shape → qty → duplicate → lookup → state** (skipping stages that do not apply). First failure throws. [ASSUMPTION] — see [ADR-002](./adr/ADR-002-error-model-and-validation-order.md).

| Method | Phase | Returns | Errors in check order |
|---|---|---|---|
| `addItem({ sku, name })` | 1 | `{ sku, name }` (copy) [ASSUMPTION] | arg not a non-null object → `invalid_input`; bad `sku` → `invalid_sku`; `name` not a string or blank → `invalid_input`; known SKU → `duplicate_sku` |
| `receive(sku, qty)` | 1 | `undefined` [ASSUMPTION] | bad `qty` → `invalid_qty`; unknown `sku` → `not_found`; result above `MAX_SAFE_INTEGER` → `invalid_qty` |
| `ship(sku, qty)` | 1 | `undefined` | bad `qty` → `invalid_qty`; unknown → `not_found`; `qty` > available → `insufficient_stock` |
| `stock(sku)` | 1 | on-hand integer | unknown → `not_found` |
| `reserve(orderId, lines)` | 2 | `undefined` | bad `orderId` → `invalid_order`; `lines` not a non-empty array → `invalid_input`; a line not an object → `invalid_input`; a line's bad `qty` → `invalid_qty`; open order → `duplicate_order`; any line's SKU unknown → `not_found`; per-SKU summed qty > available → `insufficient_stock` |
| `available(sku)` | 2 | on hand − reserved | unknown → `not_found` |
| `release(orderId)` | 2 | `undefined` | no open reservation with that id (including malformed ids) → `not_found` |
| `fulfil(orderId)` | 2 | `undefined` | as `release` |
| `history(sku)` | 3 | `Movement[]` copies, oldest first | unknown → `not_found` |
| `setReorderPoint(sku, n)` | 3 | `undefined` | bad `n` → `invalid_qty`; unknown → `not_found` |
| `reorderReport()` | 3 | `ReorderEntry[]` | none |

Rules shared by the methods:

- **Unknown-SKU policy.** Outside `addItem`, a SKU is looked up as-is; any non-matching value, including a malformed or non-string one, is `not_found`. `invalid_sku` is `addItem` only. [ASSUMPTION]
- **Order-id policy.** `reserve` validates the format (`invalid_order`). `release` and `fulfil` treat any id without an open reservation as `not_found`. [ASSUMPTION]
- **Blank name.** A `name` that is empty or only whitespace is `invalid_input`; the stored name is unchanged (not trimmed). [ASSUMPTION]
- **Repeated SKU in `lines`.** Allowed; coverage is checked on the per-SKU sum; one `reserve` movement is recorded per line as given. [ASSUMPTION]
- **Closed order ids.** An id with no open reservation may be reserved again. Open decision OD-01 in [adr/README](./adr/README.md#open-decisions). [ASSUMPTION]
- **`setReorderPoint`** records no movement (the five movement types are fixed). [ASSUMPTION]
- **Extra properties** on `addItem` input or lines are ignored, not stored.

## 5. Reservation semantics (Phase 2)

| Operation | on hand | reserved | available | Ledger |
|---|---|---|---|---|
| `reserve` | — | + qty per line | − qty | add order |
| `release` | — | − qty per line | + qty | remove order |
| `fulfil` | − qty per line | − qty per line | unchanged | remove order |
| `ship` | − qty | — | − qty | — |

`reserve` commit runs only after every check passed (ADR-003), so no line is applied if another fails.

## 6. Movement log (Phase 3)

Every successful mutator appends movements through one internal `record(sku, type, qty, orderId?)` that does `{ seq: nextSeq++, … }`. `record` is called only inside the commit step. Order operations append one movement per stored line, in line order, with consecutive `seq`. `history(sku)` filters the log by SKU and returns copies. The log is created in Phase 3; Phase 1–2 mutators gain their `record` calls then (see [ADR-006](./adr/ADR-006-movement-log.md)).

## 7. Reorder report (Phase 3)

For each item with a reorder point `r` and `a = available`: include when `a <= r`; `suggestedQty = 2*r - a`. Sort ascending by `sku` using plain code-unit comparison. Items with no reorder point never appear. `r = 0` with `a = 0` is listed with `suggestedQty` 0.

## 8. Internal layout of `src/inventory.js`

1. `InventoryError`. 2. Constants (regexes, `MAX_SAFE`). 3. Pure validators. 4. `createInventory()` closure: stores, `record`, then the methods in API order. 5. Named exports at the end.
