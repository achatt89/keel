# Low-Level Design — inventory

Implementer's contract. Single file `src/inventory.js`; tests under `test/`. Requirements: [BRD.md](BRD.md). Decisions: [adr/README.md](adr/README.md).

## 1. Module map

| Path | Owns |
|---|---|
| `src/inventory.js` | `createInventory`, `InventoryError`, validators (named exports: `createInventory`, `InventoryError` only) |
| `package.json` | `"type": "module"`, `"engines": { "node": ">=20" }`, `"scripts": { "test": "node --test" }`, no dependencies |
| `test/*.test.js` | `node:test` suites; `test/examples.test.js` runs `examples/` |
| `examples/*.js` | README examples with expected output |

## 2. Types

```
Item      { sku, name, onHand, reorderPoint? }          // internal
Line      { sku, qty }
Movement  { seq, sku, type, qty, orderId? }             // Phase 3; orderId only on order movements
Report    { sku, available, reorderPoint, suggestedQty }
```

`type`: `receive | ship | reserve | release | fulfil`.

## 3. Errors

`class InventoryError extends Error { code }`, `name` = `'InventoryError'`. Closed set of codes: `invalid_sku` `invalid_input` `duplicate_sku` `invalid_qty` `not_found` `insufficient_stock` `invalid_order` `duplicate_order` ([ADR-002](adr/ADR-002-error-contract.md)).

## 4. Validators

| Name | Rule | Code |
|---|---|---|
| sku format | string matching `/^[A-Z]{3}-[0-9]{4}$/` | `invalid_sku` (`addItem` only) |
| qty | `Number.isSafeInteger(q) && q > 0` | `invalid_qty` |
| reorder point | `Number.isSafeInteger(n) && n >= 0` | `invalid_qty` |
| name | `typeof === 'string' && length > 0` | `invalid_input` |
| orderId format | string matching `/^ORD-[0-9]+$/` | `invalid_order` (`reserve` only) |
| lines | non-empty array of non-null objects | `invalid_input` |
| addItem arg | non-null object | `invalid_input` |

## 5. Phase 1 methods

Check order everywhere: argument shape/format → state. See A-10.

| Method | Steps |
|---|---|
| `addItem({sku,name})` | arg object → sku format (`invalid_sku`) → name (`invalid_input`) → `duplicate_sku` → store `onHand: 0` |
| `receive(sku,qty)` | qty → item exists (`not_found`) → result safe integer (else `invalid_qty`, A-08) → add |
| `ship(sku,qty)` | qty → item exists → `qty <= available(sku)` else `insufficient_stock` → subtract (in Phase 1 `available` = on hand) |
| `stock(sku)` | item exists → `onHand` |

A SKU lookup uses a `Map`; any non-string or unknown SKU is `not_found` (A-02).

## 6. Phase 2 methods

| Method | Steps |
|---|---|
| `reserve(orderId, lines)` | orderId format → lines shape → each line: object, qty (`invalid_qty`) → `duplicate_order` if the id holds a reservation → each SKU exists (`not_found`) → sum qty per SKU (A-07) → each sum `<= available` else `insufficient_stock` → commit: store a copy of the lines, add to `reservedBySku` |
| `available(sku)` | item exists → `onHand - reserved` |
| `release(orderId)` | holds reservation else `not_found` (A-03) → subtract lines from `reservedBySku` → delete |
| `fulfil(orderId)` | as release, plus subtract each line from `onHand` |

`ship` uses `available` from Phase 2 (RSV-009). Invariant: `0 <= reserved <= onHand` for every SKU.

## 7. Phase 3 methods

| Method | Steps |
|---|---|
| movement append | one internal `record(sku, type, qty, orderId?)` called only inside commit blocks; `seq = ++counter`; `orderId` key present only for order types |
| `history(sku)` | item exists → copies of that SKU's movements in `seq` order |
| Existing mutators | `receive`→`receive`, `ship`→`ship`, `reserve`→`reserve` per line, `release`→`release` per line, `fulfil`→`fulfil` per line (not also `ship`) |

## 8. Reorder

| Method | Steps |
|---|---|
| `setReorderPoint(sku, n)` | n (`invalid_qty`) → item exists → store; records no movement |
| `reorderReport()` | items with a reorder point and `available <= reorderPoint`, sorted by SKU (code-unit order), each `{sku, available, reorderPoint, suggestedQty: 2*rp - available}` |

## 9. Return values

[ASSUMPTION] (BRD A-11) The founder did not specify return values. `receive`/`ship` return the new quantity on hand; `addItem`, `reserve`, `release`, `fulfil`, `setReorderPoint` return `undefined`. Tests may rely on state read back through `stock`/`available`/`history`, not on these returns. Returned objects and arrays are fresh copies (NN-5).
