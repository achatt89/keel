---
id: ADR-005
status: Accepted
paths: ["src/inventory.js"]
check: test/reservations.test.js
---

# ADR-005 — Atomic mutations — validate everything, then commit in one synchronous block

| | |
|---|---|
| **Status** | Accepted 2026-11-17 (generation) |
| **Deciders** | engineering |
| **Bounded by** | RSV-002, RSK-002, NFR-COR-003, NFR-COR-004 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

`reserve` must be all or nothing and a failing call must leave no trace, including no consumed `seq`. There is no transaction support in the language.

## Decision

| | |
|---|---|
| **Decision** | In the context of multi-line mutations on shared maps, facing rollback or pre-validation, we chose **pre-validating every line against a working copy of the per-SKU totals and only then writing state and movements**, to achieve no partial effects without undo logic, accepting that validation reads must mirror commit writes exactly. |
| **Revisit trigger** | a mutation becomes async or yields mid-commit |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Apply then roll back on error | Handles unknown failures | Undo code is itself a bug source | ✗ |
| **Validate all, then commit** | No undo; trivially atomic when sync | Duplicated reasoning in validate and commit | ✓ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Caller-supplied `lines` are copied once before validation so getters cannot change values between validate and commit. |
| Harder | The commit block must not throw. |
| Off the table | Async or yielding mutations. |
| Build deviation | — (not built yet) |
