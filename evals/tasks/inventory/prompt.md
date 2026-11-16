Build `inventory`, the stock-keeping library for a small warehouse. Node.js 20 or later, standard library only (no npm dependencies), pure in-memory logic, ES modules. `src/inventory.js` exports `createInventory()` and the error class `InventoryError`; every broken rule throws an `InventoryError` whose `code` property is the name in brackets. Quantities are positive integers [`invalid_qty`]; an unknown SKU is [`not_found`].

The work has three phases.

**Phase 1, items and stock.**
- `addItem({ sku, name })`: `sku` matches `ABC-1234` (three capital letters, a dash, four digits) [`invalid_sku`]; `name` is a non-empty string [`invalid_input`]; a SKU can be added once [`duplicate_sku`].
- `receive(sku, qty)`: adds `qty` to stock on hand.
- `ship(sku, qty)`: removes `qty` from stock on hand; never below zero [`insufficient_stock`].
- `stock(sku)`: the quantity on hand.

**Phase 2, reservations.**
- `reserve(orderId, lines)`: `orderId` matches `ORD-` and digits [`invalid_order`]; `lines` is a non-empty array of `{ sku, qty }`. All or nothing: if any line cannot be covered by the available quantity, nothing is reserved [`insufficient_stock`]. An order id that already holds a reservation [`duplicate_order`].
- `available(sku)`: stock on hand minus the quantity reserved.
- `release(orderId)`: drops the reservation [`not_found` for an unknown or closed order].
- `fulfil(orderId)`: ships every line of the reservation (stock on hand goes down) and closes it [`not_found` as above].
- From phase 2 on, `ship(sku, qty)` may only use the available quantity, never reserved stock [`insufficient_stock`].

**Phase 3, history and reorder.**
- Every successful change records a movement `{ seq, sku, type, qty }` plus `orderId` for order movements; `type` is `receive`, `ship`, `reserve`, `release` or `fulfil` (one movement per line for order operations). `seq` is one counter for the whole inventory, starting at 1.
- `history(sku)`: the movements of that SKU, oldest first.
- `setReorderPoint(sku, n)`: `n` is an integer of 0 or more [`invalid_qty`].
- `reorderReport()`: the items whose available quantity is at or below their reorder point, sorted by SKU, each as `{ sku, available, reorderPoint, suggestedQty }`, where `suggestedQty` is twice the reorder point minus the available quantity. Items without a reorder point are never listed.

Also write your own tests (runnable with `node --test`) and a README that says how to use the library and run the tests.

Build phase 1 only in this session. Later sessions will each do the next phase, starting fresh: they will not see this message.
