# inventory

Stock-keeping library for a small warehouse. Node.js 20+, standard library only, in memory.

```js
import { createInventory } from './src/inventory.js';
const inv = createInventory();
inv.addItem({ sku: 'ABC-0001', name: 'Bolt' });
inv.receive('ABC-0001', 10);
inv.reserve('ORD-1', [{ sku: 'ABC-0001', qty: 4 }]);
inv.available('ABC-0001'); // 6
inv.fulfil('ORD-1');        // stock 6
inv.setReorderPoint('ABC-0001', 8);
inv.reorderReport();        // [{ sku: 'ABC-0001', available: 6, reorderPoint: 8, suggestedQty: 10 }]
inv.history('ABC-0001');
```

Functions: `addItem`, `receive`, `ship`, `stock`, `reserve`, `available`, `release`, `fulfil`, `history`, `setReorderPoint`, `reorderReport`.
Errors are `InventoryError` with a `code`: `invalid_sku`, `invalid_input`, `duplicate_sku`, `invalid_qty`, `not_found`, `insufficient_stock`, `invalid_order`, `duplicate_order`.

## Tests

```bash
node --test
```
