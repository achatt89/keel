# Architecture Decision Records — inventory

Decisions derive from [../BRD.md](../BRD.md); ADRs record technical reasoning. One file per decision; this file is the index.

> Lifecycle: `Proposed` → `Accepted` → `Built` → `⚠️ Superseded by ADR-xxx`. No addenda — a deviation that doesn't fit the one `Build deviation` row is a new ADR.

## Index

| ADR | Title | Status | Deciders | Date |
|---|---|---|---|---|
| [ADR-001](./ADR-001-runtime-and-test-stack.md) | Runtime and test stack — Node 20 ESM, stdlib, node:test | Accepted | founder · engineering | 2026-11-17 |
| [ADR-002](./ADR-002-error-contract.md) | Error contract — one InventoryError with a closed code set | Accepted | founder · engineering | 2026-11-17 |
| [ADR-003](./ADR-003-validate-then-commit.md) | Atomicity and input safety — validate, check, commit; copy at the boundary | Accepted | engineering | 2026-11-17 |
| ADR-004 | Reserved (Phase 2) — reservation model | Proposed | — | — |
| ADR-005 | Reserved (Phase 2) — ship uses available | Proposed | — | — |
| ADR-006 | Reserved (Phase 3) — movement log | Proposed | — | — |

## Open decisions

Defaults are applied as `[ASSUMPTION]` until a human answers. A row closes by writing an ADR and removing the markers.

| # | Question | Locations | Decider | Options surfaced | Status |
|---|---|---|---|---|---|
| OD-01 | Is a whitespace-only `name` valid? | BRD A-06 | founder | accept as given (default) / trim and reject empty | Open |
| OD-02 | May a closed (released or fulfilled) order id be reserved again? | BRD A-05 | founder | allow (default, literal reading of `duplicate_order`) / never reuse | Open |
| OD-03 | Which code for `lines` that is not an array or is empty? | BRD A-04 | founder | `invalid_input` (default) / `invalid_qty` | Open |
| OD-04 | May one order list the same SKU on two lines? | BRD A-07 | founder | allow, sum for coverage (default) / reject with `invalid_input` | Open |
| OD-05 | Stock that would pass `Number.MAX_SAFE_INTEGER` | BRD A-08 | engineering | `invalid_qty` (default) / allow | Open |

---

*Index of `docs/adr/` — inventory.*
