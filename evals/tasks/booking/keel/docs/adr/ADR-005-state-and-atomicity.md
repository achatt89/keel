---
id: ADR-005
status: Accepted
paths: ["src/booking.js"]
check: test/atomicity.test.js
---

# ADR-005 — State — private Maps, copies out, validate-then-write

| | |
|---|---|
| **Status** | Accepted 2026-11-16 (generation) |
| **Deciders** | engineering |
| **Bounded by** | BO-01, BO-02, CON-003, RSK-003, RSK-004, RSK-005 |
| **Supersedes / superseded by** | — / — |
| **Phase** | Phase 1 |

## Context

Double-booking must be impossible, so no code path may write state without both conflict checks, and callers must not reach stored records.

## Decision

| | |
|---|---|
| **Decision** | In the context of an in-memory store, facing exposed arrays, per-call mutation, or a database-style index, we chose **closure-private `Map`/`Set` indexes, linear overlap scans, one write after all checks, and fresh copies on every return** to achieve no partial or externally corrupted state, accepting O(n) scans. |
| **Revisit trigger** | Real volume makes a scan slow (RSK-006). |

## Options considered

| Option | Pros | Cons | |
|---|---|---|---|
| Plain object/array state | simple | prototype keys, exposed references | ✗ |
| **Private Maps + validate-then-write + copies** | safe, atomic | O(n) scans | ✓ |
| Interval tree | fast | overkill for prototype | ✗ |

## Consequences

| Consequence | Detail |
|---|---|
| Easier | Invariant is local to one function (`book`). |
| Harder | Scans are linear. |
| Off the table | Handing out live records. |
| Build deviation | — (fill at Built) |
