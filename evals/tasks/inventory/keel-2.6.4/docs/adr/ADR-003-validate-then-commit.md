---
id: ADR-003
status: Accepted
paths: [src/inventory.js]
check: test/atomicity.test.js, test/input-safety.test.js (NFR-COR-003, NFR-SEC-001, NFR-SEC-002)
---

# ADR-003 — Atomicity and input safety — validate, check, commit; copy at the boundary

| | |
|---|---|
| **Status** | Accepted 2026-11-17 (generation) |
| **Deciders** | engineering (design) |
| **Bounded by** | NN-2, NN-3, NN-5, RSK-002, RSK-004 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

All-or-nothing reservations and "a failed call records nothing" need every rule checked before any state changes, and caller-supplied ids and objects must not become a way to corrupt state.

## Decision

| | |
|---|---|
| **Decision** | In the context of multi-line operations and untrusted arguments, facing partial updates and aliasing of caller objects, we chose **validate, then check state, then commit in one synchronous block, with `Map` storage and defensive copies in and out** to achieve atomic calls and isolated state, accepting a little copying per call. |
| **Revisit trigger** | A method must become asynchronous, or profiling shows copying is the bottleneck. |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Mutate as you go, roll back on error | Short code | Rollback bugs corrupt stock | ✗ |
| **Validate, check, then commit; Maps; copies** | Atomic by construction; safe against `__proto__` keys | Copy cost | ✓ |
| Freeze everything | Cheap | Does not stop internal aliasing of caller arrays | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Failure atomicity is testable from the public API alone. |
| Harder | The commit block must contain nothing that can throw; every new mutator follows the same shape. |
| Off the table | Async methods without a new ADR. |
| Build deviation | — (filled at Built) |
