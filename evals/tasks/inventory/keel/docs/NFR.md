# inventory — Non-Functional Requirements

**Status:** Draft v0.1 · 2026-11-16 · Evidence ladder: `unit` is the target level for every row (no deployed environment exists).

## 1. Correctness — `NFR-COR`

| ID | Requirement | Target | Verification |
|---|---|---|---|
| NFR-COR-001 | For every SKU, `0 ≤ reserved ≤ onHand` and `available = onHand − reserved` after any sequence of operations | Always | Unit: scripted sequences plus a seeded random-operation test using `node:test` only |
| NFR-COR-002 | A throwing call leaves `stock`, `available`, reservations, reorder points, `history` and the next `seq` unchanged | Always | Unit: snapshot before/after for every error path |
| NFR-COR-003 | Reserved stock is never shipped twice: `ship` and `fulfil` together never exceed received stock | Always | Unit: reserve → ship attempt → fulfil → fulfil again |
| NFR-COR-004 | `seq` is gapless 1..N across all SKUs | Always | Unit: interleaved operations on several SKUs |

## 2. Security / input handling — `NFR-SEC`

| ID | Requirement | Verification |
|---|---|---|
| NFR-SEC-001 | Every public method rejects wrong types, `NaN`, `±Infinity`, non-integers, zero, negatives and unsafe integers with the right `InventoryError` | Unit: table-driven bad-input tests per method |
| NFR-SEC-002 | Caller objects are read once; getters or Proxies that change between reads cannot make validation and commit disagree | Unit: object with a counting getter |
| NFR-SEC-003 | Mutating a passed `lines` array/objects, or a returned movement/report, after the call does not change inventory state | Unit |
| NFR-SEC-004 | Receive that would exceed `Number.MAX_SAFE_INTEGER` throws `invalid_qty` | Unit |
| NFR-SEC-005 | Error messages contain no caller-supplied object content beyond the offending primitive field name | Unit: inspect `message` |
| NFR-SEC-006 | Keys such as `__proto__`, `constructor` work as ordinary (unknown or malformed) ids without side effects | Unit |

## 3. Portability and build — `NFR-BLD`

| ID | Requirement | Verification |
|---|---|---|
| NFR-BLD-001 | Runs on Node.js ≥ 20 with no `dependencies` or `devDependencies` | Test reads `package.json`; `engines.node` is `>=20` |
| NFR-BLD-002 | ES modules (`"type": "module"`); only `node:` imports | Test greps `src/` for non-`node:` imports |
| NFR-BLD-003 | Whole suite passes with `node --test` and no flags | CI-equivalent local run, output saved as evidence |

## 4. Test and docs coverage — `NFR-TST`

| ID | Requirement | Verification |
|---|---|---|
| NFR-TST-001 | Every requirement ID in BRD §4 has at least one test that names it | Phase Verify stage maps IDs to tests |
| NFR-TST-002 | Every error code (`invalid_sku`, `invalid_input`, `duplicate_sku`, `invalid_qty`, `not_found`, `insufficient_stock`, `invalid_order`, `duplicate_order`) is asserted by `error.code`, not message | Unit |
| NFR-TST-003 | README states usage and how to run the tests, and is finished before the next phase starts | Phase exit gate (read-through) |

## 5. Performance

[ASSUMPTION] No numeric target: the founder gave none and warehouse scale is small. Per-operation cost is O(lines) and `reorderReport` is O(n log n) by design. Add `NFR-PERF` rows if the app reports a slowdown.
