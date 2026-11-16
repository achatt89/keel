# Architecture Decision Records — inventory

All decisions derive from [BRD](../BRD.md). One file per decision; this file is the index.

> Lifecycle: `Proposed` → `Accepted` → `Built` → `⚠️ Superseded by ADR-xxx`. No addenda.

## Index

| ADR | Title | Status | Deciders | Date |
|---|---|---|---|---|
| [ADR-001](./ADR-001-in-memory-esm-factory.md) | Packaging — in-memory ES module with a `createInventory()` factory | Accepted | founder · engineering | 2026-11-16 |
| [ADR-002](./ADR-002-error-model-and-atomicity.md) | Errors — `InventoryError` with closed `code` set, validate-then-apply | Accepted | founder · engineering | 2026-11-16 |
| [ADR-003](./ADR-003-reservation-model.md) | Reservations — per-item `reserved` total plus open-order map | Accepted | founder · engineering | 2026-11-16 |
| [ADR-004](./ADR-004-movement-log.md) | History — single in-memory movement array, one global `seq` | Accepted | founder · engineering | 2026-11-16 |
| [ADR-005](./ADR-005-reorder-report.md) | Reorder — computed on demand from `available` and a per-item point | Accepted | founder · engineering | 2026-11-16 |

## Open decisions

Each is a `[ASSUMPTION]` taken by default in a non-interactive run; the founder confirms or overrides.

| # | Question | Locations | Decider | Options surfaced | Status |
|---|---|---|---|---|---|
| OD-01 | May an order id be reserved again after it was released or fulfilled? | BRD A-03 · LLD §4 | founder | allow (default) / forbid forever | Open |
| OD-02 | Which code fires first when several rules break (e.g. bad qty on an unknown SKU)? | BRD A-02 · ADR-002 · LLD §4 | founder | shape→existence→state (default) / existence first | Open |
| OD-03 | Which code for malformed `lines` (not an array, empty, non-object entries)? | BRD A-04 · LLD §5 | founder | `invalid_input` (default) / `invalid_qty` / new code | Open |
| OD-04 | Is a SKU in `receive`/`ship`/`stock` format-checked (`invalid_sku`) or just `not_found`? | BRD A-01 | founder | `not_found` (default) / `invalid_sku` | Open |
| OD-05 | `history` / `setReorderPoint` on an unknown SKU, and `history` of an unmoved SKU? | BRD A-07 | founder | `not_found` and `[]` (default) | Open |
| OD-06 | Return values of mutators (`addItem` returns `{ sku, name }`, others `undefined`)? | BRD A-08 | founder | as default / return new on-hand | Open |

---

*Index of `docs/adr/` — inventory.*
