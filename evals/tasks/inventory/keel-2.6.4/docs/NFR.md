# Non-Functional Requirements — inventory

**Status:** Draft · Targets and how each is verified. Evidence rules: [conventions](../AGENTS.md) (ladder in IMPLEMENTATION_PLAN standing rules).

## 1. Correctness

| ID | Requirement | Target | Verification |
|---|---|---|---|
| NFR-COR-001 | Every error code in LLD §4 is thrown, with the right `code`, for each method and situation in its row | 100% of rows triggered | `test/errors.test.js` asserts `instanceof InventoryError` and `code` per row |
| NFR-COR-002 | Invariants N-1, N-2 hold after every call | 0 violations | Invariant test: a seeded pseudo-random sequence of ≥1,000 calls over several SKUs/orders; after each call assert on hand ≥ 0, reserved ≤ on hand, and total shipped + fulfilled ≤ total received |
| NFR-COR-003 | A throwing call changes nothing (N-3) | 0 differences | Test snapshots `stock`, `available`, `history` for all SKUs before and after each failing call and compares; `seq` of the next success is unchanged |
| NFR-COR-004 | `reserve` is all-or-nothing | 0 partial holds | Test: multi-line order where only the last line is short; no line is held, no movement exists |

## 2. Security (input trust)

| ID | Requirement | Verification |
|---|---|---|
| NFR-SEC-001 | Caller data is never aliased: mutating a passed `lines` array/object after `reserve`, or a returned `history`/`reorderReport` value, changes nothing inside | Tests mutate then re-query |
| NFR-SEC-002 | Hostile ids (`__proto__`, `constructor`, `toString`, non-strings, objects) are rejected or answered `not_found`, never crash or pollute | Tests per method with those inputs |

## 3. Maintainability and docs

| ID | Requirement | Verification |
|---|---|---|
| NFR-MNT-001 | No dependencies, no `node_modules`; Node 20+ only | Gate: `package.json` has no `dependencies`/`devDependencies`; `node --test` passes on a clean checkout |
| NFR-DOC-001 | README examples run and match stated output; each README error row has a test | `test/examples.test.js`; `<!-- keel:asserts -->` marker ([conventions "Docs under test"]) |

## 4. Not targeted

Performance, availability, scalability: no target stated (BRD A-05). Revisit if the later app reports slowness.

## 5. Build gates (every phase)

`node --test` green, with no skipped tests; no dependency added; README current. Gates per phase: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).
