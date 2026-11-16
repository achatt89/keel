---
paths:
  - "test/**"
  - "examples/**"
---
# Test rules
- Run with `node --test`, using `node:test` and `node:assert/strict`; no test dependencies: NFR-MNT-001 (`docs/NFR.md`).
- Every error code in LLD §4 is triggered per method and asserts `instanceof InventoryError` and `code`: NFR-COR-001 (`docs/NFR.md`).
- Failing calls are checked for zero side effects: NFR-COR-003 (`docs/NFR.md`).
- README examples run in `test/examples.test.js` and match their stated output: NFR-DOC-001 (`docs/NFR.md`).
