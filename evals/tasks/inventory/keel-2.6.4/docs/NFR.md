# Non-Functional Requirements — inventory

Each target has a verification method. Tests are `node:test`, run with `node --test` ([COMMANDS.md](COMMANDS.md)). Evidence levels: `unit` unless stated.

## 1. Correctness (NFR-COR)

| ID | Target | Verification | Traces to | Phase |
|---|---|---|---|---|
| NFR-COR-001 | Every error in BRD §3 is thrown as `InventoryError` with exactly the specified `code`, in the situation the BRD row names | One test per code per method (`assert.throws` on `instanceof` and `code`) | BO-03, STK-*, RSV-*, ROR-002 | 1–3 |
| NFR-COR-002 | On hand ≥ reserved for every SKU after any operation sequence; reserved stock is never shipped twice | Seeded-PRNG property test (stdlib only): random operations, invariant checked after each | RSV-009, RSV-010, RSK-001 | 2 |
| NFR-COR-003 | A failed call changes nothing: stock, reservations, movements and the next `seq` are identical before and after | Snapshot via public API before and after each failing call | HIS-006, NN-3 | 1–3 |
| NFR-COR-004 | `seq` is gapless, global and starts at 1; `history` is oldest first | Interleaved operations on several SKUs; assert `seq` 1..n | HIS-004, HIS-005 | 3 |

## 2. Security / input handling (NFR-SEC)

| ID | Target | Verification | Traces to |
|---|---|---|---|
| NFR-SEC-001 | Every public method rejects malformed input with an `InventoryError`, never a `TypeError` or a state change | Table-driven bad inputs per argument: `undefined`, `null`, numbers where strings go, `''`, `NaN`, `Infinity`, floats, negatives, `0`, strings for qty, `__proto__`/`constructor` as SKU or order id, arrays/objects in the wrong place, `Number.MAX_SAFE_INTEGER + 1` | SEC-001, NN-2 |
| NFR-SEC-002 | Mutating a returned value or a passed-in `lines` array after the call does not change inventory state | Tests mutate then re-read | NN-5, RSK-004 |
| NFR-SEC-003 | Two inventories created by `createInventory()` share no state | Test | NN-5 |

## 3. Maintainability and documentation

| ID | Target | Verification |
|---|---|---|
| NFR-MNT-001 | No dependencies; Node ≥ 20; ES modules | Test reads `package.json`: no `dependencies`/`devDependencies`, `"type": "module"`, `engines.node` `>=20` |
| NFR-MNT-002 | No imports other than `node:` built-ins | Test scans `src/**` import specifiers |
| NFR-DOC-001 | README examples run and match their expected output; every README error-table row has a test that triggers it | `test/examples.test.js` (conventions "Docs under test") |

## 4. Not specified

| Area | Stance |
|---|---|
| Performance, scale | No target (BRD A-09). Revisit when the app reports a slow call. |
| Availability, cost, observability | Not applicable to an in-process library. |
