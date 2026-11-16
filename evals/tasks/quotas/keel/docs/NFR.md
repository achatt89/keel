# Non-Functional Requirements
## filestore

**Version:** 0.1 · **References:** [ENGINEERING_DESIGN.md](./ENGINEERING_DESIGN.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

Every row has a target and a verification method. All verification is `node --test` (evidence level `unit` unless stated). Availability, scalability, observability and data-governance groups are omitted: no deployed system yet (trigger: Phase 3 scoping).

## NFR-CORR — Correctness (the core of this product)

| ID | Requirement | Target | Verification |
|---|---|---|---|
| NFR-CORR-001 | Limits equal the pricing page. | `free` 2000000000, `pro` 200000000000, `team` null — asserted as literals, not `2 * GB` (`ADR-003`). | `test/plans.test.js` table test + founder compares with the pricing page at each release. |
| NFR-CORR-002 | Quota boundaries are exact. | AC-1..AC-10, AC-12 of `PRD.md F-05`: limit allowed, limit + 1 refused, delta-only overwrite, non-increasing always allowed. | `test/quota.test.js`, one named test per AC. |
| NFR-CORR-003 | `usedBytes` equals the sum of file sizes after any operation sequence. | 0 mismatches over ≥ 1,000 seeded random sequences of write/overwrite/remove/setPlan. | `test/invariant.test.js` (seeded PRNG, stdlib only). |
| NFR-CORR-004 | A refused write changes nothing. | AC-13: deep-equal of observable state (list, usage, versions) before/after. | `test/quota.test.js` |
| NFR-CORR-005 | Check order and error type. | not_found → invalid_input → quota_exceeded in every method; only `StoreError` for caller mistakes. | `test/errors.test.js` (matrix: method × bad-user × bad-input × over-quota). |
| NFR-CORR-006 | Percent floors exactly. | 1999999999/2000000000 → 99; full → 100; 0 → 0; `used` above 2^53/100 after `team`→`free` still exact. | `test/usage.test.js` |
| NFR-CORR-007 | Limits never use binary units. | `plans.js` and quota code do not import `units.js`. | `test/boundaries.test.js` reads source text for the import. |

## NFR-SEC — Security

| ID | Requirement | Target | Verification |
|---|---|---|---|
| NFR-SEC-001 | Path confinement and input validation. | `..`, `/a/../b`, relative, empty, NUL, non-string, oversize → `invalid_input`; same for bad sizes (NaN, -1, 1.5, `'5'`, `Infinity`, > safe integer). | `test/validation.test.js` |
| NFR-SEC-002 | Caller-supplied ids are untrusted. | `__proto__`, `constructor`, `toString`, `u_0`, `u_01`, `U_1`, numbers, objects, `undefined` → `not_found`; never another user's data. | `test/validation.test.js` |
| NFR-SEC-003 | Per-user isolation. | `list`/`remove`/`usage` for user A never see or change user B's files or usage. | `test/isolation.test.js` |
| NFR-SEC-004 | No secrets or dependency surface. | `package.json` has no `dependencies`/`devDependencies`. | `test/boundaries.test.js` |

## NFR-PERF — Performance

| ID | Requirement | Target | Verification |
|---|---|---|---|
| NFR-PERF-001 | Quota check is O(1) in the number of files (given `ADR-006` counter). | No scan of the user's files in the write path. | `code-read` of the write path + counter test. No latency number set: `[ASSUMPTION]` MVP scale is small; set a target when a size is known. |

## NFR-MAINT — Maintainability

| ID | Requirement | Target | Verification |
|---|---|---|---|
| NFR-MAINT-001 | Standard library only, Node 20+, ES modules. | `package.json` `"type": "module"`, `"engines": { "node": ">=20" }`, no dependencies. | `test/boundaries.test.js` |
| NFR-MAINT-002 | Tests run with `node --test` and need no install step. | Exit code 0 on a clean checkout. | CI/manual run; artefact in `.keel/evidence/phase-N.json`. |

## NFR-BUILD — Build-time gates (definition of done)

`node --test` green · `node --check` on every `src/*.js` · no dependency added · doc-sync commit present. No linter exists (stdlib only): the boundary tests above are the custom rules.

## NFR-RESIDUAL — Accepted residual risks

`RSK-001`, `RSK-004`, `RSK-005`, `RSK-006` — see `ARCHITECTURE.md §8`.

---

*End of NFR.md — filestore*
