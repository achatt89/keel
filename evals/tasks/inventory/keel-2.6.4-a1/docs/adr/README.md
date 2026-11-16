# Architecture Decision Records — inventory

All decisions derive from constraints and requirements in [BRD.md](../BRD.md); ADRs record technical reasoning, they do not relitigate product choices. One file per decision; this file is the index.

> Lifecycle: `Proposed` → `Accepted` → `Built` → `⚠️ Superseded by ADR-xxx`. No addenda — a deviation that doesn't fit the one `Build deviation` row is a new ADR.

## Index

| ADR | Title | Status | Deciders | Date |
|---|---|---|---|---|
| [ADR-001](./ADR-001-module-shape-and-error-model.md) | Module shape and error model — factory closure with InventoryError | Accepted | founder · engineering | 2026-11-17 |
| [ADR-002](./ADR-002-validation-order-and-input-handling.md) | Validation order and input handling — arguments first, then state | Accepted | founder · engineering | 2026-11-17 |
| [ADR-003](./ADR-003-reservation-model.md) | Reservation model — per-order lines plus a per-SKU reserved sum | Accepted | founder · engineering | 2026-11-17 |
| [ADR-004](./ADR-004-movement-ledger.md) | Movement ledger — one global append-only list with a per-SKU index | Accepted | founder · engineering | 2026-11-17 |
| [ADR-005](./ADR-005-validate-then-commit.md) | Atomic mutations — validate everything, then commit | Accepted | engineering | 2026-11-17 |

## Open decisions

Each row is an [ASSUMPTION] taken by default in the non-interactive generation run; the founder confirms or overrides before the phase that builds it.

| # | Question | Locations | Decider | Options surfaced | Status |
|---|---|---|---|---|---|
| OD-01 | May an order id be reserved again after it was released or fulfilled? Default: yes (only an id that currently holds a reservation is `duplicate_order`) | [ADR-003](./ADR-003-reservation-model.md) · [LLD.md](../LLD.md) §4 | founder | allow reuse / retire closed ids forever | Open (default applied) |
| OD-02 | Which code for malformed `lines` or line shape, and for a malformed (not just unknown) SKU or order id outside `addItem`/`reserve`? Default: `invalid_input`; `not_found` | [ADR-002](./ADR-002-validation-order-and-input-handling.md) · [LLD.md](../LLD.md) §4 | founder | as default / `invalid_sku` and `invalid_order` everywhere | Open (default applied) |
| OD-03 | When two rules break at once, which code wins? Default: argument values before state, order in LLD §4 | [ADR-002](./ADR-002-validation-order-and-input-handling.md) · [LLD.md](../LLD.md) §4 | founder | as default / state first | Open (default applied) |
| OD-04 | What do mutators return? Default: `undefined` | [ADR-002](./ADR-002-validation-order-and-input-handling.md) · [LLD.md](../LLD.md) §3 | founder | `undefined` / new on-hand quantity / the movement(s) | Open (default applied) |

---

*Index of `docs/adr/` — inventory.*
