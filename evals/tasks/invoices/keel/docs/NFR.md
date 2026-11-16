# invoices — Non-Functional Requirements

**Status:** Draft · Targets derive from [BRD.md](./BRD.md) BO-01..BO-03 and [ENGINEERING_DESIGN.md §4](./ENGINEERING_DESIGN.md#4-non-negotiables). Tests: `node --test` ([COMMANDS.md](./COMMANDS.md)). Phase gates cite these IDs in [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

## 1. Correctness (the product's main quality)

| ID | Target | Verification method | Min. level | Phase |
|---|---|---|---|---|
| NFR-COR-001 | `net + vat = gross` for every invoice; all three are safe integers | property test, ≥10,000 random invoices, seeded PRNG logged | `unit` | 1 |
| NFR-COR-002 | VAT matches [LLD §4.3](./LLD.md#43-worked-examples) exactly for DE/FR/NL/AT/other, half-up, once per invoice | table-driven test of every worked example | `unit` | 1 |
| NFR-COR-003 | No floating-point money paths | test fails if the money/CSV source contains `toFixed`, `toLocaleString`, `parseFloat`, or `/` on amounts outside the audited integer-division helper | `unit` | 1 |
| NFR-COR-004 | Numbers gapless and unique per year across failed issues and voids | test: interleave valid, invalid and void operations; assert numbers `1..N` and no reuse | `unit` | 1 |
| NFR-COR-005 | Berlin date correct across both DST switches and year end | tests incl. `2026-03-31T23:30:00Z`→`2026-04-01`, last Sunday of March/October, `2025-12-31T23:30:00Z` | `unit` | 2 |
| NFR-COR-006 | CSV output is byte-exact to ADR-008 (BOM, `;`, decimal comma, CRLF incl. last row, quoting) | exact-string comparisons incl. LLD §6.3 and the empty range | `unit` | 2 |
| NFR-COR-007 | Accountant imports a sample export into German Excel/DATEV with no edits (BO-03) | human check by the accountant on a generated sample; sample file + confirmation kept as artefact (the ladder has no human-acceptance level: record as `integration` with a note) | `integration` | 2 |

## 2. Security / robustness

| ID | Target | Verification method | Min. level | Phase |
|---|---|---|---|---|
| NFR-SEC-001 | Every public function rejects malformed input with the right `InvoiceError` code: wrong types, `NaN`, `Infinity`, `-0`, fractions, unsafe integers, `null`, arrays, objects with `__proto__`/`constructor` keys, bad dates (`2026-02-30`) | table-driven negative test per input in LLD §3 | `unit` | 1 |
| NFR-SEC-002 | A failed call leaves the ledger byte-for-byte unchanged (no burned number, no half-created customer) | test: snapshot via listing before/after each failing call | `unit` | 1 |
| NFR-SEC-003 | Returned customers/invoices are frozen copies; mutating them cannot change the ledger | mutation-attempt test | `unit` | 1 |
| NFR-SEC-004 | Ids and numbers cannot be supplied by callers | test: extra `id`/`number` keys in create inputs are ignored or rejected, never used | `unit` | 1 |
| NFR-SEC-005 | Zero dependencies, `engines.node >= 20` | test reads `package.json` | `unit` | 1 |
| NFR-SEC-006 | Formula-injection policy of ADR-009 holds | test per OD-01 outcome | `unit` | 2 |

## 3. Other

| ID | Target | Verification method | Min. level | Phase |
|---|---|---|---|---|
| NFR-PERF-001 | 10,000 invoices issued + exported in < 1 s on a developer laptop `[ASSUMPTION]` | timing test, generous bound, tagged non-gating if flaky | `unit` | 2 |
| NFR-MNT-001 | Every error code has at least one test that triggers it | test enumerates the code set | `unit` | 1–2 |
| NFR-MNT-002 | The suite runs with `node --test` and no setup | clean-checkout run | `integration` | 1 |
| NFR-DATA-001 | No personal data beyond business names; nothing logged except the console summary | code-read of `console` use; summary prints name only | `code-read` | 1 |
| NFR-AVL-001 | n/a: in-process library, no service | — | — | — |
