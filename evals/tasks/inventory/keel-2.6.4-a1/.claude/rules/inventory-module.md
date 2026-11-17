---
paths:
  - "src/**"
---
# Inventory module rules
- Export only `createInventory` and `InventoryError`; state stays in the closure: ADR-001 (`docs/adr/ADR-001-module-shape-and-error-model.md`).
- Check arguments before state, in the LLD §4 order; first failure throws: ADR-002 (`docs/adr/ADR-002-validation-order-and-input-handling.md`).
- `available = onHand - reserved`; `ship` uses available only; keep `reserved` and `reservations` in step: ADR-003 (`docs/adr/ADR-003-reservation-model.md`).
- One `seq` counter, one movement per line, none for failed calls, none for `addItem`/`setReorderPoint`: ADR-004 (`docs/adr/ADR-004-movement-ledger.md`).
- Validate everything, then commit; the commit block must not throw: ADR-005 (`docs/adr/ADR-005-validate-then-commit.md`).
- Copy caller input, return copies or frozen rows, use `Map` for caller-keyed state: NFR-SEC-001 (`docs/NFR.md`).
- No imports other than `node:` built-ins: NFR-MNT-001 (`docs/NFR.md`).
