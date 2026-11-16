---
paths:
  - "src/**"
  - "test/**"
---

# Inventory core rules

- Package is ESM, stdlib only, in-memory, factory-created state: ADR-001 (`docs/adr/ADR-001-in-memory-esm-factory.md`).
- Validate everything first, mutate last; failures throw `InventoryError` with a LLD §5 code and consume no `seq`: ADR-002.
- Keep `0 ≤ reserved ≤ onHand`; `ship` and `reserve` check `available`; `fulfil` consumes the reservation: ADR-003, NFR-COR-002.
- Movements: one `seq` counter, one row per line, appended only on success: ADR-004.
- Reorder report is computed on demand: ADR-005.
- Untrusted ids: `Map` storage, strict validators, copy in/out: NFR-SEC-001, NFR-SEC-002 (`docs/NFR.md`).
