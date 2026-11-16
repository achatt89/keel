# Non-Functional Requirements — inventory

Every NFR has a target and a verification method; gates cite them in [IMPLEMENTATION_PLAN](./IMPLEMENTATION_PLAN.md).

## 1. Correctness

| ID | Target | Verification |
|---|---|---|
| NFR-COR-001 | A failing call changes no observable state and consumes no `seq` | `test/atomicity.test.js`: for every error row in LLD §5, snapshot (`stock`, `available`, `history`) before/after |
| NFR-COR-002 | Invariant `0 ≤ reserved ≤ onHand`, `available = onHand − reserved ≥ 0`, after every call of a seeded random operation sequence (≥ 1000 steps, fixed seed); reserved stock is never shipped | `test/invariant.test.js` |
| NFR-COR-003 | Every row of BRD §2 has a test asserting its exact `code` | `test/*.test.js`; README error table under test (NFR-DOC-001) |
| NFR-COR-004 | `seq` is gapless from 1 and strictly increasing (Phase 3) | `test/history.test.js` |

## 2. Security (input trust)

| ID | Target | Verification |
|---|---|---|
| NFR-SEC-001 | Hostile inputs (`__proto__`, `constructor`, `toString`, arrays, objects, `null`, `NaN`, `Infinity`, `1.5`, `'3'`, huge numbers) yield an `InventoryError` or a safe `not_found`, never a crash or a polluted prototype | `test/hostile-input.test.js`; asserts `Object.prototype` unchanged |
| NFR-SEC-002 | Mutating a passed-in `lines` array/object or a returned `history`/report array after the call does not alter inventory state | `test/aliasing.test.js` |

## 3. Maintainability and docs

| ID | Target | Verification |
|---|---|---|
| NFR-MNT-001 | Zero runtime or dev dependencies; `engines.node >= 20`; ES modules | `test/package.test.js` reads `package.json`; `node --test` is the only runner |
| NFR-MNT-002 | Public surface is exactly `createInventory` and `InventoryError` | `test/api-surface.test.js` |
| NFR-DOC-001 | README examples run and match their stated output; README error table asserted by a test | `test/examples.test.js`, marker `keel:asserts` (conventions "Docs under test") |

## 4. Performance

`[ASSUMPTION]` BRD A-11: no numeric target at small-warehouse scale. Revisit if a consumer reports slow `history` or `reorderReport` (ADR-004, ADR-005 revisit triggers).

## 5. Not applicable

Availability, scalability, cost, observability, data governance: a library with no runtime, hosting or personal data.
