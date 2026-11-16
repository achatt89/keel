# Architecture Decision Records — inventory

All decisions derive from constraints and requirements in [BRD](../BRD.md); ADRs record technical reasoning. One file per decision; this file is the index.

> Lifecycle: `Proposed` → `Accepted` → `Built` → `⚠️ Superseded by ADR-xxx`. No addenda — a deviation that doesn't fit the one `Build deviation` row is a new ADR.

## Index

| ADR | Title | Status | Deciders | Date |
|---|---|---|---|---|
| [ADR-001](./ADR-001-stdlib-esm-single-module.md) | Runtime and packaging — Node 20, ESM, stdlib only, one module | Accepted | founder · engineering | 2026-11-16 |
| [ADR-002](./ADR-002-error-model-and-validation-order.md) | Errors — one `InventoryError` with spec codes, fixed check order | Accepted | founder · engineering | 2026-11-16 |
| [ADR-003](./ADR-003-validate-then-commit-atomicity.md) | Atomicity — validate everything, then commit without throwing | Accepted | engineering | 2026-11-16 |
| [ADR-004](./ADR-004-reservation-ledger.md) | Reservations — per-order line ledger plus per-SKU reserved totals | Accepted | engineering | 2026-11-16 |
| [ADR-005](./ADR-005-defensive-copies-at-boundaries.md) | Boundaries — snapshot inputs, return copies | Accepted | engineering | 2026-11-16 |
| [ADR-006](./ADR-006-movement-log.md) | History — one append-only global log with a single counter | Accepted | engineering | 2026-11-16 |

## Open decisions

One row per question. The library follows the stated default until the founder answers; closing a row means writing an ADR.

| # | Question | Locations | Decider | Options surfaced | Default in force | Status |
|---|---|---|---|---|---|---|
| OD-01 | May an order id be reserved again after its reservation was released or fulfilled? | `docs/LLD.md` §4 · `docs/BRD.md` RSK-005 | founder | allow (literal "already holds a reservation") / never reuse a closed id (stronger double-ship guard) | Allow | Open |
| OD-02 | When several rules fail at once, which code wins? | `docs/LLD.md` §4 · ADR-002 | founder | shape → qty → duplicate → lookup → state / lookup before qty | shape → qty → duplicate → lookup → state | Open |
| OD-03 | Code for a bad `lines` value (not an array, empty, or a non-object line) | `docs/BRD.md` RSK-003, RSV-002 · `docs/LLD.md` §4 | founder | `invalid_input` / `invalid_order` | `invalid_input` | Open |
| OD-04 | Do `release`/`fulfil` on a malformed order id throw `not_found` or `invalid_order`? | `docs/LLD.md` §4 | founder | `not_found` (spec wording) / `invalid_order` | `not_found` | Open |
| OD-05 | Return values of `addItem`, `receive`, `ship` and the order methods (spec gives none) | `docs/LLD.md` §4 | founder | `undefined` for mutators, `{sku,name}` for `addItem` / return new quantity | As listed in LLD §4 | Open |

---
*Index of `docs/adr/` — inventory.*
