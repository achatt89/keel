# Low-Level Design — inventory

## 1. Module map

| Path | Owns |
|---|---|
| `src/inventory.js` | Public API: `createInventory`, `InventoryError` (the only import path for consumers) |
| `test/*.test.js` | `node:test` suites, one file per phase area, plus `test/examples.test.js` |
| `examples/` | Runnable README examples with expected output |

## 2. Public signatures

```js
export class InventoryError extends Error { code }          // name = 'InventoryError'
export function createInventory(): {
  addItem({ sku, name }),            // P1 → { sku, name }
  receive(sku, qty), ship(sku, qty), stock(sku),                    // P1
  reserve(orderId, lines), available(sku), release(orderId), fulfil(orderId), // P2
  history(sku), setReorderPoint(sku, n), reorderReport(),           // P3
}
```

## 3. Types

| Type | Shape |
|---|---|
| Item (private) | `{ name, onHand, reserved, reorderPoint: number \| null }` |
| Line | `{ sku: string, qty: positive safe integer }` |
| Movement | `{ seq, sku, type, qty }` + `orderId` when `type` ∈ reserve, release, fulfil. `receive`/`ship` have no `orderId` key. |
| ReorderRow | `{ sku, available, reorderPoint, suggestedQty }` |

## 4. Operation contracts

Validation order per call (A-02): shape → existence → state. First failing check throws; nothing is mutated. [ASSUMPTION] where noted in [BRD §4](./BRD.md).

| Call | Checks, in order | Effect |
|---|---|---|
| `addItem(x)` | x object with own `sku`,`name`; `sku` string matching `^[A-Z]{3}-\d{4}$` else `invalid_sku`; `name` string, non-empty after trim else `invalid_input`; unknown sku else `duplicate_sku` | item with onHand 0, reserved 0, no reorder point |
| `receive(sku, qty)` | `qty` valid (`invalid_qty`, incl. overflow A-10); sku known (`not_found`) | onHand += qty |
| `ship(sku, qty)` | `qty` valid; sku known; `qty ≤ available` else `insufficient_stock` (P1: available = onHand) | onHand −= qty |
| `stock(sku)` | sku known | returns onHand |
| `reserve(id, lines)` | `id` string matching `^ORD-\d+$` else `invalid_order`; `lines` non-empty array of objects else `invalid_input`; each `qty` valid else `invalid_qty`; each sku known else `not_found`; no open order with `id` else `duplicate_order`; per-SKU summed qty ≤ available else `insufficient_stock` | reserved += qty per line; order stored (copied) |
| `available(sku)` | sku known | onHand − reserved |
| `release(id)` | open order `id` else `not_found` | reserved −= qty per line; order closed |
| `fulfil(id)` | open order `id` else `not_found` | onHand −= qty and reserved −= qty per line; order closed |
| `history(sku)` | sku known | copy of that SKU's movements by `seq` |
| `setReorderPoint(sku, n)` | `Number.isSafeInteger(n) && n ≥ 0` else `invalid_qty`; sku known | item.reorderPoint = n |
| `reorderReport()` | — | items with a point and `available ≤ point`, sorted by SKU (code-unit order), `suggestedQty = 2×point − available` |

Movements (Phase 3): `receive`/`ship` → one each; `reserve`/`release`/`fulfil` → one per line, in line order, same `orderId`; `release`/`fulfil` use the stored lines. One `seq` counter, +1 per movement, only after all checks pass.

## 5. Error codes (closed set)

| Code | Raised when |
|---|---|
| `invalid_sku` | `addItem` sku does not match `ABC-1234` |
| `invalid_input` | `addItem` name empty/non-string; `addItem` arg not an object; `reserve` lines not a non-empty array of objects |
| `duplicate_sku` | `addItem` for an existing SKU |
| `invalid_qty` | qty not a positive safe integer; reorder point not an integer ≥ 0 |
| `not_found` | unknown SKU; unknown or closed order id |
| `insufficient_stock` | `ship`/`reserve` beyond available quantity |
| `invalid_order` | `reserve` orderId not `ORD-` + digits |
| `duplicate_order` | `reserve` for an order id with an open reservation |

Error message text is human-readable and not part of the contract; only `code` is.
