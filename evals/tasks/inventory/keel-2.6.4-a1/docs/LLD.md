# Low-Level Design — inventory

**Status:** Draft · The implementer's contract. Decisions behind it: [docs/adr/](./adr/README.md).

## 1. Module map

| File | Exports | Phase |
|---|---|---|
| `src/inventory.js` | `createInventory`, `InventoryError` (nothing else) | 1–3 |
| `package.json` | `"type": "module"`, `"engines": { "node": ">=20" }`, `"scripts": { "test": "node --test" }`, no `dependencies` | 1 |
| `test/*.test.js` | tests (`node:test`, `node:assert/strict`) | 1–3 |
| `examples/*.js` + `.out` | README examples under test | 1–3 |

## 2. Types

```
Sku        string matching /^[A-Z]{3}-\d{4}$/
OrderId    string matching /^ORD-\d+$/
Qty        a safe integer > 0                (for n in setReorderPoint: safe integer >= 0)
Line       { sku: string, qty: Qty }
Movement   { seq, sku, type, qty }  | { seq, sku, type, qty, orderId }   (frozen)
ReorderRow { sku, available, reorderPoint, suggestedQty }
class InventoryError extends Error { code: string }   name = 'InventoryError'
```

## 3. API

Phase column = when it first exists. Behaviour per rule: BRD IDs in the Rule column.

| Method | Returns | Behaviour | Rule | Phase |
|---|---|---|---|---|
| `addItem({ sku, name })` | `undefined` | Registers the item with on hand 0 and no reorder point | ITM-001..003 | 1 |
| `receive(sku, qty)` | `undefined` | on hand += qty | ITM-004 | 1 |
| `ship(sku, qty)` | `undefined` | on hand −= qty; allowed only if qty ≤ on hand (P1) / ≤ available (P2+) | ITM-005, RSV-005 | 1, 2 |
| `stock(sku)` | number | on hand | ITM-006 | 1 |
| `reserve(orderId, lines)` | `undefined` | Holds every line or none | RSV-001..003 | 2 |
| `available(sku)` | number | on hand − reserved | RSV-004 | 2 |
| `release(orderId)` | `undefined` | Drops the reservation; reserved −= each line | RSV-006 | 2 |
| `fulfil(orderId)` | `undefined` | For each line: on hand −= qty, reserved −= qty; closes the reservation | RSV-007 | 2 |
| `history(sku)` | `Movement[]` (new array, oldest first) | The SKU's movements | HST-003 | 3 |
| `setReorderPoint(sku, n)` | `undefined` | Sets the item's reorder point | ROP-001 | 3 |
| `reorderReport()` | `ReorderRow[]` | Items with a reorder point and available ≤ reorderPoint, sorted by SKU ascending (code-unit order); `suggestedQty = 2 * reorderPoint - available` | ROP-002, ROP-003 | 3 |

Return values of mutators are `undefined` [ASSUMPTION, [ADR-002](./adr/ADR-002-validation-order-and-input-handling.md)].

## 4. Errors and validation order

Codes: `invalid_sku`, `invalid_input`, `duplicate_sku`, `invalid_qty`, `not_found`, `insufficient_stock`, `invalid_order`, `duplicate_order`. Checks run in the order listed per method; the first failure throws ([ADR-002](./adr/ADR-002-validation-order-and-input-handling.md)).

| Method | Checks, in order → code |
|---|---|
| `addItem` | argument is an object → `invalid_input`; `sku` is a string matching Sku → `invalid_sku`; `name` is a non-empty string → `invalid_input`; SKU not yet added → `duplicate_sku` |
| `receive` | qty valid → `invalid_qty`; SKU exists → `not_found` |
| `ship` | qty valid → `invalid_qty`; SKU exists → `not_found`; qty ≤ available → `insufficient_stock` |
| `stock`, `available`, `history` | SKU exists → `not_found` (any non-string or malformed SKU does not exist) |
| `reserve` | `orderId` string matching OrderId → `invalid_order`; `lines` a non-empty array → `invalid_input`; each line an object with a string `sku` → `invalid_input`; each line's qty valid → `invalid_qty`; order id holds no open reservation → `duplicate_order`; every line's SKU exists → `not_found`; per-SKU summed qty ≤ available → `insufficient_stock` |
| `release`, `fulfil` | an open reservation exists for the id → `not_found` (a malformed id has none) |
| `setReorderPoint` | `n` a safe integer ≥ 0 → `invalid_qty`; SKU exists → `not_found` |
| `reorderReport` | no arguments, no errors |

Before Phase 2 `ship` checks qty ≤ on hand. `test/errors.test.js` triggers every row of this table and of the README error table; it grows each phase.

## 5. Movements

| Call | Movements appended (in order) |
|---|---|
| `receive` | one `receive` `{sku, qty}` |
| `ship` | one `ship` `{sku, qty}` |
| `reserve` | one `reserve` per line, line order, with `orderId` |
| `release` | one `release` per line, line order, with `orderId` |
| `fulfil` | one `fulfil` per line, line order, with `orderId`; no extra `ship` rows |
| `addItem`, `setReorderPoint`, any throwing call | none |

`seq` is issued as `++seq` per appended movement, so a multi-line order gets consecutive numbers ([ADR-004](./adr/ADR-004-movement-ledger.md)). Duplicate-SKU lines keep their line order and each gets its own movement.

## 6. Reorder report

For each item with `reorderPoint !== null` and `onHand - reserved <= reorderPoint`: `{ sku, available, reorderPoint, suggestedQty: 2 * reorderPoint - available }`, sorted by `sku`. With reorder point 0 and available 0 the row is listed with `suggestedQty` 0.

## 7. Implementation rules

| Rule | Reason |
|---|---|
| Validate all, then mutate ([ADR-005](./adr/ADR-005-validate-then-commit.md)) | N-3 |
| Copy `lines` into fresh `{ sku, qty }` objects; never read a caller getter twice | SEC-002; a getter returning different values per read would break atomicity |
| Return fresh arrays/objects; movements are `Object.freeze`d | SEC-002 |
| Use `Map`, never an object keyed by caller input | SEC-001 |
