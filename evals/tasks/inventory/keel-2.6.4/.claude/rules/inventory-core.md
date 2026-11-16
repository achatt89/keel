---
paths:
  - "src/**"
  - "test/**"
  - "package.json"
---

# Inventory core rules

- Node 20+, ES modules, standard library only; no `npm` dependencies, no non-`node:` imports: ADR-001 (`docs/adr/ADR-001-runtime-and-test-stack.md`), NFR-MNT-001, NFR-MNT-002 (`docs/NFR.md`).
- Every rule violation throws `InventoryError` with the specified `code`; check order is argument shape first, then state: ADR-002 (`docs/adr/ADR-002-error-contract.md`), NFR-COR-001.
- Validate, then check state, then commit in one synchronous block; copy values in and out; use `Map`, never plain objects keyed by caller input: ADR-003 (`docs/adr/ADR-003-validate-then-commit.md`), NFR-COR-003, NFR-SEC-001, NFR-SEC-002.
- A failed call must not change stock, reservations, movements or `seq`: ADR-003, NFR-COR-003.
