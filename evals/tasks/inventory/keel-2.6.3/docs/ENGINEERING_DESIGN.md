# Engineering Design — inventory

## 1. Pillars

| Pillar | Meaning |
|---|---|
| Exactness | Rules and error codes are the product; no behaviour beyond the spec without a founder decision. |
| Atomic by construction | Validate everything, then apply; a failed call changes nothing. |
| One source of truth | Stock, reserved totals and the movement log are mutated in one place only. |

## 2. Domain model

Per `createInventory()` instance, private state: `items: Map<sku, { name, onHand, reserved, reorderPoint|null }>`, `orders: Map<orderId, lines[]>` (open reservations only), `movements: Movement[]`, `seq` counter. Detail: [LLD §3](./LLD.md).

## 3. Data classification

All data is C0 (public-grade: SKUs, names, quantities, order ids). Nothing sensitive; no compliance regime applies (see [COMPLIANCE](./COMPLIANCE.md) stub).

## 4. Non-negotiables

| # | Rule | Reason / home |
|---|---|---|
| NN-1 | Invariant `0 ≤ reserved ≤ onHand` for every item at every call boundary; `available = onHand − reserved`. | BO-01, [ADR-003](./adr/ADR-003-reservation-model.md) |
| NN-2 | Every failure throws `InventoryError` with a `code` from the closed set in [LLD §5](./LLD.md); no other error type escapes for bad input. | ERR-001, [ADR-002](./adr/ADR-002-error-model-and-atomicity.md) |
| NN-3 | A failed call mutates nothing and consumes no `seq`. | NFR-COR-001 |
| NN-4 | All stock decreases go through one internal helper; `ship` checks `available`, `fulfil` consumes reservation. | RSK-001 |
| NN-5 | Never trust caller ids: validate before use; keyed storage is `Map`, never plain objects. | ERR-002, NFR-SEC-001 |
| NN-6 | No dependencies beyond Node 20 built-ins; no I/O. | CON-001, CON-002, [ADR-001](./adr/ADR-001-in-memory-esm-factory.md) |
| NN-7 | Callers never receive or retain internal references (copy in, copy out). | NFR-SEC-002 |

## 5. Build order

Phase 1 stock first (the thing reservations count against), Phase 2 reservations (changes `ship`), Phase 3 history (touches every mutator, so last, when mutators are stable) and reorder (needs `available`).
